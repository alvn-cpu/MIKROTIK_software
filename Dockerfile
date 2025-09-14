FROM node:20-alpine

WORKDIR /app

# Copy everything first (simpler approach)
COPY . .

# Install root dependencies
RUN npm ci --omit=optional --no-audit --no-fund || npm install --omit=optional --no-audit --no-fund

# Install backend dependencies  
RUN cd backend && npm ci --only=production --omit=optional --no-audit --no-fund || npm install --only=production --no-audit --no-fund

# Install frontend dependencies (with legacy peer deps for React Scripts compatibility)
RUN cd frontend && npm ci --legacy-peer-deps --omit=optional --no-audit --no-fund || npm install --legacy-peer-deps --no-audit --no-fund

# Verify frontend structure before building
RUN echo "Frontend directory contents:" && ls -la frontend/
RUN echo "Frontend public directory contents:" && ls -la frontend/public/
RUN test -f frontend/public/index.html && echo "✓ index.html found" || echo "✗ index.html NOT found"

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
