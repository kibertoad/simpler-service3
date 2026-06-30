#!/usr/bin/env bash
set -euo pipefail

# Apply the kustomize overlay to the k3s prenv with image-tag rewriting and
# Vault-supplied env file.
#
# Inputs (env, all optional except TAG):
#   TAG                  required — image tag for repo-built services
#   K8S_NAMESPACE        default: simpler-service3-prenv
#   K8S_OVERLAY          default: deployment/k8s/overlays/prenv
#   ECR_PREFIX           default: 053497547689.dkr.ecr.eu-central-1.amazonaws.com/simpler-service3
#   REPO_BUILT_SERVICES  default: simpler-service3

: "${TAG:?TAG is required}"
K8S_NAMESPACE="${K8S_NAMESPACE:-simpler-service3-prenv}"
K8S_OVERLAY="${K8S_OVERLAY:-deployment/k8s/overlays/prenv}"
ECR_PREFIX="${ECR_PREFIX:-053497547689.dkr.ecr.eu-central-1.amazonaws.com/simpler-service3}"
REPO_BUILT_SERVICES="${REPO_BUILT_SERVICES:-simpler-service3}"

# Snapshot/restore root kustomization.yaml so reused workspaces don't carry
# stale image tags into the next run. Trap restores on any exit.
SNAPSHOT_DIR=$(mktemp -d)
restore_overlay() {
    local rc=$?
    if [ -f "$SNAPSHOT_DIR/kustomization.yaml" ]; then
        cp "$SNAPSHOT_DIR/kustomization.yaml" "$K8S_OVERLAY/kustomization.yaml"
    fi
    rm -rf "$SNAPSHOT_DIR"
    # Wipe the Vault-sourced plaintext env file so it doesn't survive on the
    # Jenkins workspace between runs.
    rm -f "$K8S_OVERLAY/simpler-service3/.env"
    exit "$rc"
}
trap restore_overlay EXIT
cp "$K8S_OVERLAY/kustomization.yaml" "$SNAPSHOT_DIR/kustomization.yaml"

# --- Distribute Vault-supplied env file into the overlay component ---
# Vault writes a single .env.simpler-service3 under $K8S_OVERLAY/env/. The `app`
# Deployment consumes the kustomize Secret built from it, so we copy this one
# file into the single overlay component.
echo "==> Distributing env file into overlay component..."
SRC="$K8S_OVERLAY/env/.env.simpler-service3"
DST="$K8S_OVERLAY/simpler-service3/.env"
if [ ! -f "$SRC" ]; then
    echo "FAIL: missing $SRC from Vault drop"
    exit 1
fi
rm -f "$DST"
cp "$SRC" "$DST"

# --- Inject image tags ---
echo "==> Setting image tags to $TAG..."
sed -i.bak '/^images:/,$d' "$K8S_OVERLAY/kustomization.yaml" && rm -f "$K8S_OVERLAY/kustomization.yaml.bak"
printf 'images:\n' >> "$K8S_OVERLAY/kustomization.yaml"
for svc in $REPO_BUILT_SERVICES; do
    printf '  - name: %s/%s\n    newTag: %s\n' "$ECR_PREFIX" "$svc" "$TAG" \
        >> "$K8S_OVERLAY/kustomization.yaml"
done

# --- Apply ---
echo "==> Cleaning up immutable resources..."
kubectl -n "$K8S_NAMESPACE" delete job --all --ignore-not-found

echo "==> Waiting for Envoy Gateway controller..."
kubectl -n gateway rollout status deployment/envoy-gateway --timeout=120s 2>/dev/null || true

echo "==> Capturing pre-existing deployments..."
EXISTING_DEPS=$(kubectl -n "$K8S_NAMESPACE" get deployments -o jsonpath='{.items[*].metadata.name}' 2>/dev/null || echo "")

echo "==> Applying kustomize manifests..."
kubectl apply -k "$K8S_OVERLAY"

echo "==> Waiting for statefulsets..."
for sts in $(kubectl -n "$K8S_NAMESPACE" get statefulsets -o jsonpath='{.items[*].metadata.name}'); do
    kubectl -n "$K8S_NAMESPACE" rollout status "statefulset/$sts" --timeout=300s
done

# Force-restart pre-existing deployments so a re-deploy with the same tag
# still picks up image changes (kubectl apply with same spec is a no-op).
echo "==> Forcing rollout for pre-existing deployments (same-tag safety)..."
# Repo-built services map to k8s Deployment names: simpler-service3 → app.
DEPLOY_NAMES=""
for svc in $REPO_BUILT_SERVICES; do
    case "$svc" in
        simpler-service3) DEPLOY_NAMES="$DEPLOY_NAMES app" ;;
        *) DEPLOY_NAMES="$DEPLOY_NAMES $svc" ;;
    esac
done
for dep in $DEPLOY_NAMES; do
    if echo " $EXISTING_DEPS " | grep -q " $dep "; then
        kubectl -n "$K8S_NAMESPACE" rollout restart "deployment/$dep"
    else
        echo "  Skipping $dep (first deploy)"
    fi
done

echo "==> Waiting for deployments..."
for dep in $(kubectl -n "$K8S_NAMESPACE" get deployments -o jsonpath='{.items[*].metadata.name}'); do
    kubectl -n "$K8S_NAMESPACE" rollout status "deployment/$dep" --timeout=600s
done

echo "==> Deploy complete."
