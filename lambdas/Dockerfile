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

# Install Python dependencies with cleanup
RUN pip install --no-cache-dir -r requirements.txt -t /lambda/python \
    && find /lambda/python -type d -name '__pycache__' -exec rm -rf {} + \
    && find /lambda/python -type d -name '*.dist-info' -exec rm -rf {} +

# Copy the Lambda function code into the container
COPY lambdas /var/task

# Set the entry point to the function handler
CMD ["lambda_function.handler"]