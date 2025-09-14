# Railway.com optimized Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm install --legacy-peer-deps --no-audit --no-fund
RUN cd backend && npm install --only=production --no-audit --no-fund
RUN cd frontend && npm install --legacy-peer-deps --no-audit --no-fund

# Copy all source files
COPY . .

# Build frontend (Railway works better with simple commands)
RUN cd frontend && npm run build

# Copy frontend build to backend public folder
RUN mkdir -p backend/public && cp -r frontend/build/* backend/public/

# Set work directory to backend for Railway
WORKDIR /app/backend

# Railway uses PORT environment variable
EXPOSE 3000
ENV NODE_ENV=production

# Start command for Railway
CMD ["npm", "start"]

# Create public directory in backend and copy build files
RUN mkdir -p backend/public && cp -r frontend/build/* backend/public/

# Set working directory to backend
WORKDIR /app/backend

# Expose port (Railway will override this)
EXPOSE $PORT

ENV NODE_ENV=production

# Start the application
CMD ["node", "server.js"]
