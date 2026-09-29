FROM nginx:alpine

RUN apk add --no-cache openssl

COPY nginx.conf /etc/nginx/nginx.conf
COPY generate-dev-certs.sh /docker-entrypoint.d/01-generate-certs.sh
RUN chmod +x /docker-entrypoint.d/01-generate-certs.sh

# Certbot webroot for Let's Encrypt ACME challenges
RUN mkdir -p /var/www/certbot /etc/nginx/certs

EXPOSE 80 443 8080

CMD ["nginx", "-g", "daemon off;"]
