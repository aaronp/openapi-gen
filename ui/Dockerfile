FROM node:22-alpine

WORKDIR /usr/src/app

COPY rollup.config.js ./
COPY package*.json ./

RUN npm install

# COPY ./src ./src
# COPY ./static ./static
COPY . .

RUN npm run build

EXPOSE 8080

ENV HOST=0.0.0.0

CMD ["npm", "run", "start", "--", "--host"]