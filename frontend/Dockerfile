# Simple Node.js hosting for React
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Install a simple static file server
RUN npm install -g serve

# Serve the 'dist' folder on port 8080 (Cloud Run default)
CMD ["serve", "-s", "dist", "-l", "8080"]

# Expose 8080
EXPOSE 8080