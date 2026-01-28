# Multi-stage build for multix-ui
# Build context must be repository root: docker build -f packages/ui/Dockerfile .

# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for native modules if needed
RUN apk add --no-cache python3 make g++ && \
    ln -sf python3 /usr/bin/python

# Copy repository (use .dockerignore at repo root to exclude unneeded files)
COPY . .

# Install dependencies (from repo root for workspaces)
RUN corepack enable && yarn install --immutable

# Build UI
RUN yarn workspace multix-ui build

# Stage 2: Production stage - nginx to serve static build
FROM nginx:alpine AS production

# Copy built assets from builder
COPY --from=builder /app/packages/ui/build /usr/share/nginx/html

# SPA fallback + logs to stdout/stderr so they show in docker logs / kubectl logs
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    access_log /dev/stdout; \
    error_log /dev/stderr; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /health { \
        access_log off; \
        return 200 "ok"; \
        add_header Content-Type text/plain; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
