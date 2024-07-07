# OpenApi Gen

This project exports a data schema based on field collections, and an openapi schema for those fields.

# Usage

```sh
docker run -v $(pwd)/schema.json:/usr/src/app/schema.json -v $(pwd)/output:/usr/src/app/output openapi-generator
```

# Roadmap:

 * get the main entrypoint working:
    * read a json file as input
    * parse it
    * produce an openapi file as output
         

# Steps

Setup project using:
```
npm init -y
npm install typescript ts-node @types/node fs-extra
```