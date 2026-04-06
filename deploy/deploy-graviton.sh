#!/bin/bash
# Deploy soulcore-web to Graviton
# Run from the soulcore-web/ root directory
# Prerequisites: docker buildx with ARM64 support, SSH access to Graviton

set -e

GRAVITON_HOST="ubuntu@54.226.105.147"
GRAVITON_KEY="${GRAVITON_SSH_KEY:-$HOME/.ssh/graviton.pem}"
REMOTE_DIR="/home/ec2-user/soulcore-web"
IMAGE_NAME="soulcore-web"
IMAGE_TAR="soulcore-web-arm64.tar"

echo "🏗️  Building ARM64 image..."
docker buildx build \
  --platform linux/arm64 \
  --load \
  -t $IMAGE_NAME:latest \
  -f apps/web/Dockerfile \
  apps/web/

echo "📦 Saving image..."
docker save $IMAGE_NAME:latest > $IMAGE_TAR

echo "📤 Uploading to Graviton..."
scp -i "$GRAVITON_KEY" $IMAGE_TAR $GRAVITON_HOST:/tmp/

echo "🚀 Loading + starting on Graviton..."
ssh -i "$GRAVITON_KEY" $GRAVITON_HOST << 'REMOTE'
  docker load < /tmp/soulcore-web-arm64.tar
  rm /tmp/soulcore-web-arm64.tar
  docker stop soulcore-web 2>/dev/null || true
  docker rm soulcore-web 2>/dev/null || true
  docker run -d \
    --name soulcore-web \
    --restart unless-stopped \
    -p 127.0.0.1:3000:3000 \
    -e NODE_ENV=production \
    --memory=256m \
    --cpus=0.5 \
    soulcore-web:latest
  echo "✅ Container running:"
  docker ps --filter name=soulcore-web --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
REMOTE

rm $IMAGE_TAR
echo "🎉 Deploy complete. Run: curl -k https://soulcore.dev/api/health"
