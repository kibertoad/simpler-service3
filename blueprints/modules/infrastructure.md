# infrastructure

Cross-cutting technical plumbing: HTTP server bootstrapping and route wiring, port configuration, TypeScript tooling and build scripts, dependency management, container image, and Kubernetes/Envoy Gateway deployment manifests (gateway routing, rate limiting, Valkey, app/dozzle services) with Kargo-driven deploy automation and CI rendering.


**Code references:**
- `package.json`
- `tsconfig.json`
- `src/index.ts`
- `scripts/build.sh`
- `Dockerfile`
- `deployment/k8s`
- `deployment/deploy.kargo.sh`
- `.github/workflows/k8s-render.yml`
