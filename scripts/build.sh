#!/usr/bin/env bash
set -euo pipefail

# Kargo build entry point. Builds the service image and pushes it to ECR under
# the tag Kargo expects the deploy step to consume.
#
# Inputs (env):
#   TAG         image tag to build/push (default: PRE-local)
#   ECR_PREFIX  ECR repo prefix (default: Lokalise eu-central-1 simpler-service3)

TAG="${TAG:-PRE-local}"
ECR_PREFIX="${ECR_PREFIX:-053497547689.dkr.ecr.eu-central-1.amazonaws.com/simpler-service3}"
IMAGE="$ECR_PREFIX/simpler-service3:$TAG"

echo "==> Building $IMAGE..."
docker build -t "$IMAGE" .

echo "==> Pushing $IMAGE..."
docker push "$IMAGE"

echo "==> Build complete: $IMAGE"
