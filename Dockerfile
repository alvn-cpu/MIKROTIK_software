# syntax=docker/dockerfile:1

FROM node:20-alpine

WORKDIR /app

# Copy all package.json files first for caching
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install root dependencies (minimal)
RUN npm install --only=production --no-audit --no-fund

# Install backend dependencies
WORKDIR /app/backend
RUN npm ci --only=production --no-audit --no-fund

# Install frontend dependencies and build
WORKDIR /app/frontend
RUN npm ci --no-audit --no-fund

# Copy source code
WORKDIR /app
COPY . .

# Build frontend
WORKDIR /app/frontend
RUN npm run build

# Set working directory to backend for running the server
WORKDIR /app/backend

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]

