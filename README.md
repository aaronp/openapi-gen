# OpenApi Gen

This project exports a data schema based on field collections, and an openapi schema for those fields.

It takes as input [a basic json file](./data/example.json) (which adheres to [these types](./src/types.ts)): 
```
  [
    {
      "name": "User",
      "fields": [
        { "name": "id", "type": "string", "required": true },
        { "name": "username", "type": "string", "required": true },
        { "name": "email", "type": "email", "required": true },
        { "name": "createdAt", "type": "date" }
      ]
    },
    {
      "name": "Product",
      "fields": [
        { "name": "id", "type": "string", "required": true },
        { "name": "name", "type": "string", "required": true },
        { "name": "price", "type": "decimal", "required": true },
        { "name": "quantity", "type": "int", "required": true },
        { "name": "createdAt", "type": "date" }
      ]
    }
  ]
```

And produces [an open-api spec](./data/example.yaml) for reading that data (getting it by ID, listing or querying it):

```
...
  /data/user/{id}:
    get:
      summary: Get User by ID
      operationId: getUserById
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: A User
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
...
```



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