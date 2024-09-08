# Node.js build stage
FROM node:18 AS builder

# Set OpenSSL legacy provider environment variable
ENV NODE_OPTIONS=--openssl-legacy-provider

# Set the working directory
WORKDIR /app

# Install Node.js dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the application code
COPY . .

# Build the application
RUN npm run build

# Python build stage
FROM python:3.9 AS python-builder

# Set the working directory
WORKDIR /lambdas

# Copy the Python requirements
COPY lambdas/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt -t /lambda/python

# Copy the Lambda functions
COPY lambdas /lambda

# Create a zip file with the dependencies and functions
RUN cd /lambda && zip -r /lambda/lambda-package.zip .

# Production image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy Node.js build artifacts
COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/public /app/public
COPY --from=builder /app/package.json /app/package-lock.json /app/

# Install production dependencies
RUN npm install --only=production

# Copy Lambda package
COPY --from=python-builder /lambda/lambda-package.zip /lambda/lambda-package.zip

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
