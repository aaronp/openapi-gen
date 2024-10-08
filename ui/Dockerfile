FROM node:22 AS build

WORKDIR /app

# --memory 4g
# Install Java (required for openapi-generator-cli)
RUN apt-get update --allow-unauthenticated --allow-insecure-repositories && apt-get install -y --no-install-recommends default-jre-headless

# Install openapi-generator-cli
RUN npm install -g @openapitools/openapi-generator-cli

COPY package*.json .

RUN npm ci

COPY . .
RUN openapi-generator-cli generate -i ./schema/openapi.yaml -g typescript-fetch -o ./src/lib/generated

# RUN npm run generate-api
RUN npm run build
RUN npm prune --production


# ------------------
FROM node:22 AS run

ENV NODE_ENV=production

WORKDIR /app
COPY --from=build /app .
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules

RUN ulimit -c unlimited

LABEL maintainer="Aaron Pritzlaff <aaron@kindservices.co.uk>"
LABEL usage="docker run -p 3000:3000 -v `pwd`/scripts:/app/imports -v `pwd`/d8a:/app/data -v `pwd`/out:/app/output docker.io/kindservices/openapi-gen-ui:latest"
LABEL version="1.2.1"
LABEL org.opencontainers.image.source="https://github.com/aaronp/openapi-gen"
LABEL org.opencontainers.image.url="https://kindservices.co.uk"
LABEL license="Apache-2.0"
LABEL vendor="Kind Services Ltd"



VOLUME ["/app/data", "/app/output", "/app/imports"]

ENTRYPOINT ["node", "build"]
