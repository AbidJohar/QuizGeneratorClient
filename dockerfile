# ---------- STAGE 1: Build the React app ----------
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install || npm install

# Copy rest of the source code
COPY . .

# Build the app
RUN npm run build


# ---------- STAGE 2: Serve using Nginx ----------
FROM nginx:alpine

# Clean the default nginx html directory
RUN rm -rf /usr/share/nginx/html/*

# Copy build from React app into nginx's public folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx server
CMD ["nginx", "-g", "daemon off;"]
