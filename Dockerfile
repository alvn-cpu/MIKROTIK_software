# CACHE BUSTER: Railway Dockerfile v3.0 - FORCE REBUILD
FROM node:20-alpine

# Add cache buster
RUN echo "Building WiFi Billing System - Force Rebuild $(date)"

WORKDIR /app

# Copy ALL files first (different approach to force cache clear)
COPY . .

# Debug: Show what was copied
RUN echo "=== FILES COPIED ==="
RUN ls -la
RUN echo "=== FRONTEND DIR ==="
RUN ls -la frontend/
RUN echo "=== FRONTEND/PUBLIC DIR ==="
RUN ls -la frontend/public/ || echo "PUBLIC DIR MISSING"

# Install dependencies with proper conflict resolution
RUN npm install --legacy-peer-deps --no-audit --no-fund
RUN cd backend && npm install --only=production --no-audit --no-fund  

# Clean install frontend dependencies to resolve ajv conflicts
RUN cd frontend && rm -rf node_modules package-lock.json
RUN cd frontend && npm install --legacy-peer-deps --force --no-audit --no-fund

# FORCE CREATE index.html if missing
RUN mkdir -p frontend/public
RUN if [ ! -f "frontend/public/index.html" ]; then echo "Creating index.html"; echo '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>WiFi Billing System</title></head><body><noscript>You need to enable JavaScript to run this app.</noscript><div id="root"></div></body></html>' > frontend/public/index.html; fi

# Verify index.html exists
RUN echo "=== FINAL VERIFICATION ==="
RUN ls -la frontend/public/
RUN cat frontend/public/index.html
RUN echo "✅ Index.html ready for build"

# Build frontend with verbose output and webpack fixes
RUN echo "Starting React build..."
ENV GENERATE_SOURCEMAP=false
ENV CI=false
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN cd frontend && npm run build

# Copy build to backend
RUN mkdir -p backend/public && cp -r frontend/build/* backend/public/

# Set work directory and start
WORKDIR /app/backend
EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "start"]