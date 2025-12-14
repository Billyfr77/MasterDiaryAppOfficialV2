# Stage 1: Build the React Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
# Accept the Maps API Key as a build argument
ARG VITE_GOOGLE_MAPS_API_KEY
# Set it as an environment variable so Vite can inline it during build
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
# Build the frontend to the 'dist' folder
RUN npm run build

# Stage 2: Setup the Backend and Serve Frontend
FROM node:20-slim
WORKDIR /app

# Copy Backend Dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production

# Copy Backend Code
COPY backend/ .

# Copy Built Frontend Assets from Stage 1 to Backend's public folder
# The backend is configured to serve static files from ./public in production
COPY --from=frontend-builder /app/frontend/dist ./public

# Expose the port
EXPOSE 5003

# Set Environment to Production
ENV NODE_ENV=production

# Start the server
CMD [ "npm", "start" ]