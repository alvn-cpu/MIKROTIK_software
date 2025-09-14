# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json .npmrc* ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
RUN npm ci --omit=optional --no-audit --no-fund

# Frontend build
FROM base AS frontend-build
WORKDIR /app/frontend
COPY frontend ./
RUN npm run build

# Backend
FROM base AS backend
WORKDIR /app/backend
COPY backend ./
COPY --from=frontend-build /app/frontend/build ../frontend/build
ENV NODE_ENV=production
CMD ["node", "server.js"]

