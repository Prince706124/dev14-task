# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy package.json first
COPY package.json ./

# Install dependencies and fix Rollup optional dependencies issue
RUN npm install && \
    npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]