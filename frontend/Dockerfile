# Build stage
FROM --platform=linux/amd64 node:20 as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --include=dev

# Explicitly ensure Vite is available
RUN npm list vite || npm install vite

# Copy source code
COPY . .

# Set environment variable for build
ENV VITE_API_URL=/api
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build the app using npx
RUN npx vite build

# Output built files
FROM scratch
COPY --from=build /app/dist /