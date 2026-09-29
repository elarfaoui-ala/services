#!/bin/sh
# Smart cert entrypoint — handles self-signed (dev) and Let's Encrypt (prod).
#
# Dev:  generates self-signed certs at /etc/nginx/certs/
# Prod: symlinks from /etc/letsencrypt/live/$DOMAIN/ to /etc/nginx/certs/

CERT_DIR="/etc/nginx/certs"
CERT_FILE="$CERT_DIR/fullchain.pem"
KEY_FILE="$CERT_DIR/privkey.pem"

mkdir -p "$CERT_DIR"

# If certs already exist at the expected path, nothing to do
if [ -f "$CERT_FILE" ] && [ -f "$KEY_FILE" ]; then
  echo "Certificates already present at $CERT_DIR — skipping."
  exit 0
fi

# Production: symlink Let's Encrypt certs if DOMAIN is set
if [ -n "$DOMAIN" ]; then
  LE_CERT="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
  LE_KEY="/etc/letsencrypt/live/$DOMAIN/privkey.pem"
  if [ -f "$LE_CERT" ] && [ -f "$LE_KEY" ]; then
    echo "Linking Let's Encrypt certs for $DOMAIN..."
    ln -sf "$LE_CERT" "$CERT_FILE"
    ln -sf "$LE_KEY" "$KEY_FILE"
    exit 0
  fi
  echo "DOMAIN=$DOMAIN set but certs not found at $LE_CERT — falling back to self-signed."
fi

# Dev: generate self-signed certificate
echo "Generating self-signed certificate for localhost..."
openssl req -x509 -nodes -days 365 \
  -subj "/C=US/ST=Dev/L=Dev/O=Services/CN=localhost" \
  -newkey rsa:2048 \
  -keyout "$KEY_FILE" \
  -out "$CERT_FILE" \
  2>/dev/null

echo "Self-signed certificate generated at $CERT_DIR"
