# syntax=docker/dockerfile:1

# Frontend build
FROM node:20-alpine AS frontend-build
WORKDIR /app

# Copy only frontend package.json first
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
# Install frontend dependencies
RUN npm ci --omit=optional --no-audit --no-fund

# Copy frontend source code and build
COPY frontend ./
RUN npm run build

# Final image with static files
FROM nginx:alpine AS frontend
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
