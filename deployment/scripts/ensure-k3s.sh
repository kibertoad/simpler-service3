#!/usr/bin/env bash
set -euo pipefail

# Idempotent prep for the k3s prenv: install or upgrade Envoy Gateway.
# Safe to run before every deploy. No env vars required.

echo "==> Installing/upgrading Envoy Gateway..."
helm upgrade --install envoy-gateway oci://docker.io/envoyproxy/gateway-helm \
    --version v1.8.0 \
    --namespace gateway --create-namespace \
    --set rateLimit.enabled=true \
    --set config.envoyGateway.rateLimit.backend.type=Redis \
    --set config.envoyGateway.rateLimit.backend.redis.url=redis://ratelimit-valkey.simpler-service3-prenv.svc.cluster.local:6379 \
    --wait --timeout=180s
echo "==> Envoy Gateway ready"
