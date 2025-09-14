# syntax=docker/dockerfile:1

# Frontend build
FROM node:20-alpine AS frontend-build
WORKDIR /app
# Copy package.json files for dependencies
COPY package*.json .npmrc* ./
COPY frontend/package*.json ./frontend/
# Install dependencies
RUN npm ci --omit=optional --no-audit --no-fund
# Build frontend
WORKDIR /app/frontend
COPY frontend ./
RUN npm run build

# Final image with static files
FROM nginx:alpine AS frontend
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
