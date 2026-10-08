# -----------Stage 1: install production dependencies-----

FROM node:20-alpine AS deps

# Set the working directory
WORKDIR /app

# Copy package files first so this layer can be cached
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev


# -------Stage 2: run the backend API-------

FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Use production settings
ENV NODE_ENV=production

# Copy dependencies from the first stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the backend source code
COPY --chown=node:node server.js ./

# Run as the non-root node user
USER node

# The API listens on port 4000
EXPOSE 4000

# Check whether the API and database are available
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=5 \
  CMD node -e "require('http').get('http://localhost:4000/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# Start the backend API
CMD ["node", "server.js"]
