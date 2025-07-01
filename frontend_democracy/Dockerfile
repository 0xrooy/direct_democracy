# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy environment file
COPY .env.docker .env

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source code
COPY . .

# Build the project (optional if you're using `next dev`)
# RUN npm run build

# Expose port and run dev server
EXPOSE 3000

CMD ["npm", "run", "dev"]
