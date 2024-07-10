FROM node:22 AS build

WORKDIR /app

# Install Java (required for openapi-generator-cli)
RUN apt-get update && apt-get install -y default-jre-headless

# Install openapi-generator-cli
RUN npm install -g @openapitools/openapi-generator-cli

COPY package*.json .

RUN npm ci

COPY . .
RUN openapi-generator-cli generate -i ./schema/openapi.yaml -g typescript-fetch -o ./src/lib/generated

# RUN npm run generate-api
RUN npm run build
RUN npm prune --production

# ---  
ENV NODE_ENV=production

RUN ulimit -c unlimited
ENTRYPOINT ["node", "build"]
#ENTRYPOINT ["bash"]