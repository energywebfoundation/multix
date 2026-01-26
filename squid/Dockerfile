# Multi-stage build for multix-squid

# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules (bufferutil needs this)
RUN apk add --no-cache python3 make g++ && \
    ln -sf python3 /usr/bin/python

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY schema.graphql ./
COPY db/ ./db/
COPY assets/ ./assets/
COPY squid-manifests/ ./squid-manifests/
COPY .eslintrc.js .prettierrc.js .prettierignore ./

# Build TypeScript
RUN npm run build

# Stage 2: Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy node_modules from builder (already compiled with native modules)
COPY --from=builder /app/node_modules ./node_modules

# Copy built files from builder stage
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/schema.graphql ./
COPY --from=builder /app/db ./db
COPY --from=builder /app/assets ./assets
COPY --from=builder /app/squid-manifests ./squid-manifests

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose GraphQL port (for API server)
EXPOSE 4350

# Default command (can be overridden)
CMD ["node", "-r", "dotenv/config", "lib/main.js"]
