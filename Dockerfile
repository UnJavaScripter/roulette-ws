# Base image
FROM node:18.16-alpine3.16

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the entire app directory
COPY . .

# Expose port
EXPOSE 3000

# Command to run the app
CMD ["npm", "start"]
