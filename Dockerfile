# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* .npmrc* ./
RUN npm i --omit=optional --no-audit --no-fund

# Backend
FROM base AS backend
WORKDIR /app/backend
COPY backend/package.json ./
RUN npm i --no-audit --no-fund
COPY backend ./
ENV NODE_ENV=production
CMD ["node", "server.js"]
