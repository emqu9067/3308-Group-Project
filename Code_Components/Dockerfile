FROM node:19-bullseye-slim

# Use the official Node.js image as the base image

# Create and switch to your application directory
WORKDIR /usr/src/app

# Copy your source file(s) to this directory
COPY src/index.js ./src/
COPY src/package.json ./src/
COPY src/package-lock.json ./src/

# Navigate to the 'src' directory to install dependencies and build the app
WORKDIR /usr/src/app/src

# Install dependencies
RUN npm install

# Go back to the root directory
WORKDIR /usr/src/app

# Copy the rest of the application files
COPY src/resources ./src/resources
COPY src/views ./src/views

# Expose port 80, which is the port your application is listening on
EXPOSE 80

# Start your application
CMD ["node", "src/index.js"]
