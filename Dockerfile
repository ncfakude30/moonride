# Node.js build stage
FROM node:18 AS builder

# Set OpenSSL legacy provider environment variable
ENV NODE_OPTIONS=--openssl-legacy-provider

# Set the working directory in the root folder
WORKDIR /app

# Install Node.js dependencies
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps --no-audit --prefer-offline --production

# Copy the application code
COPY . .

# Build the application
RUN npm run build


# AWS Lambda Python environment (also install in root)
FROM public.ecr.aws/lambda/python:3.9 AS python-builder

# Set the working directory in the root folder
WORKDIR /app

# Install pip if it's not available and upgrade it
RUN python -m ensurepip --upgrade || true
RUN python -m pip install --upgrade pip

# Copy the requirements file and install dependencies in root
COPY lambdas/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Lambda function code into the root folder
COPY lambdas /app


# Production image (Node.js Alpine)
FROM node:18-alpine

# Set the working directory in the root folder
WORKDIR /app

# Copy Node.js build artifacts from the build stage
COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/public /app/public
COPY --from=builder /app/package.json /app/package-lock.json /app/

# Install production dependencies
RUN npm ci --production --no-audit --prefer-offline --no-optional

# Copy Python Lambda package from the python-builder stage
COPY --from=python-builder /app /app

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]
