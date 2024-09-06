# Use the official Node.js image.
FROM node:18 AS builder

# Set OpenSSL legacy provider environment variable
ENV NODE_OPTIONS=--openssl-legacy-provider

# Set the working directory.
WORKDIR /app

# Install dependencies.
COPY package.json package-lock.json ./
RUN npm install

# Copy the application code.
COPY . .

# Build the application.
RUN npm run build

# Use a smaller base image for the runtime.
FROM node:18-alpine

# Set the working directory.
WORKDIR /app

# Copy only the build artifacts and necessary files from the builder image.
COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/public /app/public
COPY --from=builder /app/package.json /app/package-lock.json /app/

# Install production dependencies.
RUN npm install --only=production

# Expose the port the app runs on.
EXPOSE 3000

# Start the application.
CMD ["npm", "start"]