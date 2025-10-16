# Use an official Node runtime as a parent image
FROM node:20-slim

# Install system packages required to compile better-sqlite3 and provide the sqlite3 CLI
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    sqlite3 \
  && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Bundle app source
COPY src ./src
COPY .env.example ./

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["node", "src/index.js"]
