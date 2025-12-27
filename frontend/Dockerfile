# Build stage
FROM node:20 as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Set environment variable for build
ENV VITE_API_URL=/api
ENV NODE_OPTIONS="--max-old-space-size=8192"

RUN npm run build --verbose

# Production stage
FROM nginx:alpine

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]