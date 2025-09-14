# syntax=docker/dockerfile:1

# Use Node.js 20 alpine as base
FROM node:20-alpine

WORKDIR /app

# Copy package.json files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci --omit=optional --no-audit --no-fund

# Copy backend source
COPY backend ./backend

# Copy frontend source and build
COPY frontend ./frontend
WORKDIR /app/frontend
RUN npm run build

# Switch back to app directory
WORKDIR /app

# Copy frontend build to backend public directory
RUN cp -r /app/frontend/build/* /app/backend/public/ 2>/dev/null || mkdir -p /app/backend/public && cp -r /app/frontend/build/* /app/backend/public/

# Switch to backend directory
WORKDIR /app/backend

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start the server
CMD ["node", "server.js"]
