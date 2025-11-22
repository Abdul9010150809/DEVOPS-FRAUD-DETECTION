# DevOps Fraud Shield Frontend Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY frontend/package.json ./

# Install dependencies
RUN npm install

# Copy frontend source code
COPY frontend/ .

# Build the application
RUN npm run build

# Install serve to serve the built application
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Set environment variable for production
ENV NODE_ENV=production

# Serve the built application
CMD ["serve", "-s", "build", "-l", "3000"]