# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json .npmrc* ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
RUN npm ci --omit=optional --no-audit --no-fund

# Frontend build
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY package*.json .npmrc* ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
RUN npm ci --omit=optional --no-audit --no-fund
WORKDIR /app/frontend
COPY frontend ./
RUN npm run build

# Backend
FROM frontend-build AS backend
WORKDIR /app/backend
COPY backend ./
ENV NODE_ENV=production
CMD ["node", "server.js"]
