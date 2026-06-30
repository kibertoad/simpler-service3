#!/usr/bin/env bash
set -euo pipefail

# Kargo PREnv deploy entry point. Provisions Envoy Gateway if missing, then
# applies the kustomize overlay with image-tag injection and Vault env-file
# distribution. See deployment/scripts/{ensure-k3s.sh,deploy-k3s.sh}.

: "${TAG:?TAG is required}"

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
cd "$SCRIPT_DIR/.."

deployment/scripts/ensure-k3s.sh

K8S_NAMESPACE="${K8S_NAMESPACE:-simpler-service3-prenv}" \
    K8S_OVERLAY="${K8S_OVERLAY:-deployment/k8s/overlays/prenv}" \
    ECR_PREFIX="${ECR_PREFIX:-053497547689.dkr.ecr.eu-central-1.amazonaws.com/simpler-service3}" \
    REPO_BUILT_SERVICES="${REPO_BUILT_SERVICES:-simpler-service3}" \
    TAG="$TAG" \
    deployment/scripts/deploy-k3s.sh
