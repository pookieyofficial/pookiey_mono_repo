# Use Node.js LTS version as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy TypeScript config
COPY tsconfig.json ./

# Copy source code
COPY src ./src

# Install dev dependencies for building
RUN npm install

# Build TypeScript code
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Expose port 6969
EXPOSE 6969

# Set environment variable for port (though it defaults to 6969)
ENV PORT=6969

# Start the server
CMD ["npm", "start"]

