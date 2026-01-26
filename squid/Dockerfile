# Multi-stage build for multix-squid

# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

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

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

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
