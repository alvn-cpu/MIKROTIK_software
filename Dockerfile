FROM node:20-alpine

WORKDIR /app

# Copy everything at once to avoid any issues
COPY . .

# Show what was copied
RUN echo "Root directory contents:" && ls -la
RUN echo "Frontend directory contents:" && ls -la frontend/
RUN echo "Frontend public directory contents:" && ls -la frontend/public/ || echo "Frontend public directory DOES NOT EXIST"

# Install root dependencies
RUN npm ci --omit=optional --no-audit --no-fund || npm install --omit=optional --no-audit --no-fund

# Install backend dependencies  
WORKDIR /app/backend
RUN npm ci --only=production --omit=optional --no-audit --no-fund || npm install --only=production --no-audit --no-fund

# Install and build frontend
WORKDIR /app/frontend
RUN npm ci --legacy-peer-deps --omit=optional --no-audit --no-fund || npm install --legacy-peer-deps --no-audit --no-fund

# Debug: Comprehensive file system check
RUN pwd && echo "=== CURRENT DIRECTORY CONTENTS ===" && ls -la
RUN echo "=== PUBLIC DIRECTORY CHECK ===" && ls -la public/ || echo "PUBLIC DIRECTORY NOT FOUND"
RUN echo "=== INDEX.HTML CHECK ===" && test -f public/index.html && echo "✓ index.html FOUND" || echo "✗ index.html NOT FOUND"

# If public directory or index.html is missing, try to create it
RUN if [ ! -d "public" ]; then echo "Creating public directory" && mkdir -p public; fi
RUN if [ ! -f "public/index.html" ]; then echo "Copying index.html from parent directory" && cp /app/frontend/public/index.html public/index.html 2>/dev/null || echo "Could not copy index.html"; fi

# Final verification before build
RUN echo "=== FINAL VERIFICATION ===" && test -f public/index.html && echo "✓ READY TO BUILD" || echo "✗ STILL MISSING FILES"

# Build frontend
RUN npm run build

# Create public directory in backend and copy build files
RUN mkdir -p backend/public && cp -r frontend/build/* backend/public/

# Set working directory to backend
WORKDIR /app/backend

# Expose port (Railway will override this)
EXPOSE $PORT

ENV NODE_ENV=production

# Start the application
CMD ["node", "server.js"]
