# syntax=docker/dockerfile:1
# build from repo root:  docker build -f ai-module/frontend/Dockerfile .
FROM node:20-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_AI_API_URL=http://localhost/api
ARG NEXT_PUBLIC_AUTH_URL=http://localhost/api
ENV NEXT_PUBLIC_AI_API_URL=${NEXT_PUBLIC_AI_API_URL}
ENV NEXT_PUBLIC_AUTH_URL=${NEXT_PUBLIC_AUTH_URL}
ENV NEXT_TELEMETRY_DISABLED=1

# Workspace manifests so `npm ci` can reconcile the root lockfile
COPY package.json package-lock.json ./
COPY shared/core/package.json shared/core/
COPY auth-module/backend/package.json auth-module/backend/
COPY auth-module/frontend/package.json auth-module/frontend/
COPY notification-module/backend/package.json notification-module/backend/
COPY notification-module/frontend/package.json notification-module/frontend/
COPY dashboard-module/backend/package.json dashboard-module/backend/
COPY dashboard-module/frontend/package.json dashboard-module/frontend/
COPY dashboard-module/shared/package.json dashboard-module/shared/
COPY ai-module/backend/package.json ai-module/backend/
COPY ai-module/frontend/package.json ai-module/frontend/

RUN --mount=type=cache,target=/root/.npm npm ci --ignore-scripts

COPY ai-module/frontend/ ai-module/frontend/
RUN npm run build --workspace @services/ai-frontend

# ── Production image ──────────────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app
ARG NEXT_PUBLIC_AI_API_URL=http://localhost/api
ARG NEXT_PUBLIC_AUTH_URL=http://localhost/api
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
COPY shared/core/package.json shared/core/
COPY auth-module/backend/package.json auth-module/backend/
COPY auth-module/frontend/package.json auth-module/frontend/
COPY notification-module/backend/package.json notification-module/backend/
COPY notification-module/frontend/package.json notification-module/frontend/
COPY dashboard-module/backend/package.json dashboard-module/backend/
COPY dashboard-module/frontend/package.json dashboard-module/frontend/
COPY dashboard-module/shared/package.json dashboard-module/shared/
COPY ai-module/backend/package.json ai-module/backend/
COPY ai-module/frontend/package.json ai-module/frontend/

ENV PORT=3000
EXPOSE 3000
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/ai-module/frontend ai-module/frontend

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
CMD ["npm", "run", "start", "-w", "@services/ai-frontend"]