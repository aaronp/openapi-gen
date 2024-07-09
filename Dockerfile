# Use the official Node.js image as the base image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package.json ./
COPY package-lock.json ./

# Install project dependencies
RUN npm install

RUN mkdir /data

# Copy the rest of the project files
COPY src src
COPY p*.json ./

# Specify the command to run your project
#CMD ["node", "src/index.ts"]
CMD ["npx",  "ts-node", "src/index.ts", "/data"]
