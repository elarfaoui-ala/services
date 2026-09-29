#!/bin/sh
# One-time setup for Let's Encrypt certificates in production.
#
# Usage:
#   1. Set DOMAIN and EMAIL in .env
#   2. npm run docker:prod  (starts gateway on port 80)
#   3. npm run certs:init   (requests cert via Let's Encrypt staging)
#   4. Verify cert works, then run with --production flag below

set -e

DOMAIN="${DOMAIN:?Set DOMAIN in .env}"
EMAIL="${EMAIL:?Set EMAIL in .env}"

MODE="${1:-staging}"

echo "Requesting Let's Encrypt certificate for $DOMAIN ($MODE)..."

EXTRA_ARGS=""
if [ "$MODE" = "production" ]; then
  echo "WARNING: Using production Let's Encrypt. Rate limits apply."
else
  EXTRA_ARGS="--staging"
  echo "Using Let's Encrypt staging (for testing)."
fi

docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm certbot \
  certbot certonly \
    --webroot \
    -w /var/www/certbot \
    -d "$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    $EXTRA_ARGS

echo ""
echo "Certificate obtained. Restart the gateway to pick it up:"
echo "  npm run docker:prod"
