# Deployment

Kubernetes deployment for `simpler-service3`, modeled on the Lokalise `skynet`
prenv setup: a [Kustomize](https://kustomize.io/) base + overlay applied to a
k3s PREnv by [Kargo](https://github.com/lokalise), fronted by
[Envoy Gateway](https://gateway.envoyproxy.io/).

> Terraform / cluster provisioning is out of scope here — this directory only
> covers the Kubernetes (kustomize + helm) layer.

## Layout

```
deployment/
  deploy.kargo.sh            # Kargo PREnv entry point
  scripts/
    ensure-k3s.sh            # helm install/upgrade Envoy Gateway (+ Redis rate-limit backend)
    deploy-k3s.sh            # image-tag injection + Vault env distribution + kubectl apply -k
    static-render.sh         # CI: render the overlay with placeholder env (no Vault needed)
  k8s/
    base/
      namespace.yaml
      services/app/          # the Hono service (Deployment + Service)
      services/valkey/       # Valkey cache (StatefulSet + Service)
      services/dozzle/       # log viewer (Deployment + Service + RBAC)
      gateway/               # Envoy Gateway, HTTPRoutes, rate limits, XFF, rate-limit Valkey
    overlays/
      prenv/                 # PREnv overlay (namespace + image tags + Secret from env)
        simpler-service3/    # secretGenerator component (envFrom for the app)
        env/                 # Vault drops .env.simpler-service3 here at deploy time
```

## Traffic & rate limiting

Envoy Gateway terminates HTTP on port 80 and routes to the `app` Service:

- `/` and `/health` — no rate limit (`simpler-service3-http-route`).
- `/kenguroos`, `/users` — rate limited via `BackendTrafficPolicy`:
  - **30 req/min** per source IP when an `Authorization: Bearer …` header is
    present (`simpler-service3-authenticated`).
  - **10 req/min** per source IP otherwise (`simpler-service3-public`).

Rate-limit counters live in an ephemeral `ratelimit-valkey` Deployment; Envoy
Gateway is configured to use it as its Redis backend in `ensure-k3s.sh`.

## Configuration

The `app` Deployment gets its environment from the `simpler-service3-secret`
Secret, generated from an `.env` file. In CI that file comes from
`.env.example` (placeholders); at deploy time Kargo writes the real values from
Vault into `deployment/k8s/overlays/prenv/env/.env.simpler-service3`, which
`deploy-k3s.sh` copies into the overlay component.

## Local validation

Render the overlay without a Vault drop:

```bash
bash deployment/scripts/static-render.sh
```

This is the same check CI runs (`.github/workflows/k8s-render.yml`).
