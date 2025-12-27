# Build stage
FROM --platform=linux/amd64 node:20 as build

# Install system dependencies if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Debug: Show package.json content
RUN cat package.json

# Set environment for development to ensure dev dependencies
ENV NODE_ENV=development

# Install ALL dependencies explicitly
RUN npm install --include=dev --verbose

# Debug: Check if vite was installed
RUN ls -la node_modules/.bin/ | grep vite || echo "Vite not found in .bin"
RUN which vite || echo "Vite not in PATH"
RUN npm list vite || echo "Vite not in dependencies"

# Copy source code
COPY . .

# Set environment variable for build
ENV VITE_API_URL=/api
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build the app
RUN npm run build

# Just output the built files
FROM scratch
COPY --from=build /app/dist /a