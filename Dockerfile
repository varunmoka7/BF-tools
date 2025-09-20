# =============================================================================
# Multi-stage Docker build for Waste Intelligence Platform
# Optimized for security, performance, and minimal attack surface
# =============================================================================

# =============================================================================
# Stage 1: Base Image with Security Hardening
# =============================================================================
FROM node:18-alpine AS base

# Install security updates and essential packages
RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
        dumb-init \
        tini \
        curl \
        && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

# Set up secure directories
WORKDIR /app
RUN chown -R nextjs:nodejs /app

# =============================================================================
# Stage 2: Dependencies Installation
# =============================================================================
FROM base AS deps

# Copy package files
COPY package*.json ./
COPY apps/waste-intelligence-platform/package*.json ./apps/waste-intelligence-platform/

# Install production dependencies only
USER nextjs
RUN npm ci --only=production --no-audit --no-fund && \
    npm cache clean --force

# =============================================================================
# Stage 3: Build Stage
# =============================================================================
FROM base AS builder

# Copy package files and install all dependencies
COPY package*.json ./
COPY apps/waste-intelligence-platform/package*.json ./apps/waste-intelligence-platform/

# Install all dependencies (including dev)
USER root
RUN npm ci --no-audit --no-fund
USER nextjs

# Copy source code
COPY --chown=nextjs:nodejs . .

# Build the application
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN cd apps/waste-intelligence-platform && \
    npm run build

# =============================================================================
# Stage 4: Backend Build
# =============================================================================
FROM base AS backend-builder

# Copy backend source
COPY --chown=nextjs:nodejs backend/ ./backend/
COPY --chown=nextjs:nodejs package*.json ./

USER root
RUN npm ci --only=production --no-audit --no-fund
USER nextjs

# Build backend
RUN npm run backend:build

# =============================================================================
# Stage 5: Production Runtime
# =============================================================================
FROM base AS runner

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Security environment variables
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV UV_THREADPOOL_SIZE=4

# Create app directory with proper permissions
USER root
RUN mkdir -p /app/.next && \
    chown -R nextjs:nodejs /app

# Copy production dependencies
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/apps/waste-intelligence-platform/.next ./apps/waste-intelligence-platform/.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/waste-intelligence-platform/public ./apps/waste-intelligence-platform/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/waste-intelligence-platform/package.json ./apps/waste-intelligence-platform/package.json

# Copy backend
COPY --from=backend-builder --chown=nextjs:nodejs /app/backend/dist ./backend/dist
COPY --from=backend-builder --chown=nextjs:nodejs /app/backend/package.json ./backend/package.json

# Copy essential files
COPY --chown=nextjs:nodejs package.json ./
COPY --chown=nextjs:nodejs scripts/ ./scripts/

# Create logs directory
RUN mkdir -p /app/logs && \
    chown -R nextjs:nodejs /app/logs

# Security: Remove unnecessary packages and files
RUN apk del curl && \
    rm -rf /var/cache/apk/* && \
    rm -rf /tmp/* && \
    rm -rf /root/.npm

# Security: Set read-only filesystem for application
RUN chmod -R 555 /app && \
    chmod -R 755 /app/logs && \
    chmod -R 755 /app/.next

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node scripts/health-check.js || exit 1

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Use tini as init system for proper signal handling
ENTRYPOINT ["tini", "--"]

# Start the application
CMD ["npm", "start"]

# =============================================================================
# Metadata Labels
# =============================================================================
LABEL \
    org.opencontainers.image.title="Waste Intelligence Platform" \
    org.opencontainers.image.description="Secure waste management intelligence platform" \
    org.opencontainers.image.version="1.0.0" \
    org.opencontainers.image.vendor="Waste Intelligence" \
    org.opencontainers.image.source="https://github.com/varunmoka7/BF-tools" \
    security.scan.enabled="true"