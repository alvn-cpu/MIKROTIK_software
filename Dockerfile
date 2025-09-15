# Railway-specific Dockerfile to fix index.html issue
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm install --legacy-peer-deps --no-audit --no-fund
RUN cd backend && npm install --only=production --no-audit --no-fund
RUN cd frontend && npm install --legacy-peer-deps --no-audit --no-fund

# Copy all source files
COPY . .

# CRITICAL: Manually ensure index.html exists before building
RUN ls -la frontend/
RUN ls -la frontend/public/ || mkdir -p frontend/public
RUN test -f frontend/public/index.html || echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>WiFi Billing</title></head><body><div id="root"></div></body></html>' > frontend/public/index.html
RUN echo "✅ Index.html verification complete"

# Build frontend
RUN cd frontend && npm run build

# Copy build to backend
RUN mkdir -p backend/public && cp -r frontend/build/* backend/public/

# Set work directory and start
WORKDIR /app/backend
EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "start"]