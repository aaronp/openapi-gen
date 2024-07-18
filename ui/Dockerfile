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


# ------------------
FROM node:22 AS run

ENV NODE_ENV=production

WORKDIR /app
COPY --from=build /app .
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules

RUN ulimit -c unlimited

LABEL maintainer="Aaron Pritzlaff <aaron@kindservices.co.uk>"
LABEL usage="docker run -p 3000:3000 -v `pwd`/d8a:/app/data -v `pwd`/out:/app/output docker.io/kindservices/openapi-gen-ui:latest"
LABEL version="1.1.0"
LABEL org.opencontainers.image.source="https://github.com/aaronp/openapi-gen"
LABEL org.opencontainers.image.url="https://kindservices.co.uk"
LABEL license="Apache-2.0"
LABEL vendor="Kind Services Ltd"



VOLUME ["/app/data", "/app/output"]

ENTRYPOINT ["node", "build"]
