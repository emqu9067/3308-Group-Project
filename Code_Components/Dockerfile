FROM node:19-bullseye-slim

# Create and switch to your application directory
# that will exist inside your Docker container.
WORKDIR /usr/src/app

# Copy your source file(s) to this directory
# This assumes that this Dockerfile is at the same level as your server file.
# This will probably change
COPY ./src/index.js ./

# Expose port 80, the default port for a web server to listen on.
EXPOSE 80

# Start up your application
CMD ["node", "index.js"]