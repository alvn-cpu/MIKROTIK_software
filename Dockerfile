FROM node:20-alpine

WORKDIR /app

# Copy all package.json files first for better layer caching
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install root and backend dependencies
RUN npm ci --omit=optional --no-audit --no-fund
RUN cd backend && npm ci --only=production --omit=optional --no-audit --no-fund

# Install frontend dependencies and build
RUN cd frontend && npm ci --omit=optional --no-audit --no-fund

# Copy source code
COPY frontend ./frontend
COPY backend ./backend

# Build frontend
RUN cd frontend && npm run build

# Create public directory in backend and copy build files
RUN mkdir -p backend/public && cp -r frontend/build/* backend/public/

# Set working directory to backend
WORKDIR /app/backend

# Expose port (Railway will override this)
EXPOSE $PORT

ENV NODE_ENV=production

# Start the application
CMD ["node", "server.js"]
