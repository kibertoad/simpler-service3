#!/usr/bin/env bash
set -euo pipefail

# Render the prenv overlay using checked-in `.env.example` placeholders so
# CI can validate the kustomize tree without a Vault drop.
#
# Usage: deployment/scripts/static-render.sh
# Exits non-zero on render failure.

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
REPO_ROOT=$(cd "$SCRIPT_DIR/../.." && pwd)
OVERLAY="$REPO_ROOT/deployment/k8s/overlays/prenv"

cleanup() {
    rm -f "$OVERLAY/simpler-service3/.env"
}
trap cleanup EXIT

cp "$OVERLAY/simpler-service3/.env.example" "$OVERLAY/simpler-service3/.env"

kubectl kustomize "$OVERLAY" > /dev/null
echo "==> Static render OK."
