# Node.js build stage
FROM node:18 AS builder

# Set OpenSSL legacy provider environment variable
ENV NODE_OPTIONS=--openssl-legacy-provider

# Set the working directory
WORKDIR /app

# Install Node.js dependencies
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps --no-audit --prefer-offline --production

# Copy the application code
COPY . .

# Build the application
RUN npm run build

# Use the official AWS Lambda base image for Python
FROM public.ecr.aws/lambda/python:3.9

# Set the working directory inside the container
WORKDIR /var/task

# Install pip if it's not available and upgrade it
RUN python -m ensurepip --upgrade || true
RUN python -m pip install --upgrade pip

# Copy the requirements file and install dependencies
COPY lambdas/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Lambda function code into the container
COPY lambdas /var/task

# Production image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy Node.js build artifacts
COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/public /app/public
COPY --from=builder /app/package.json /app/package-lock.json /app/

# Install production dependencies
RUN npm ci --production --no-audit --prefer-offline --no-optional

# Copy Lambda package
COPY --from=python-builder /var/task /var/task

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start", "lambda_function.handler"]
