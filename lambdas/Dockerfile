# Use the official AWS Lambda base image for Python
FROM public.ecr.aws/lambda/python:3.9

# Install pip if it's not available
RUN apt-get update && apt-get install -y python3-pip

# Set the working directory inside the container
WORKDIR /var/task

# Copy the requirements file and install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the function code into the container
COPY . .

# Set the entry point to the function handler
# You can specify the handler here if needed or in the `serverless.yml`
CMD ["lambda_function.handler"]