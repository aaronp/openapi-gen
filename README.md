# OpenApi Gen

This project exports a data schema based on field collections, and an openapi schema for those fields.

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](https://www.apache.org/licenses/LICENSE-2.0) file for details.


## Usage:
```sh
docker run --rm -v `pwd`/data:/data kindservices/openapi-gen:latest 2>/dev/null > openapi.yml
```

It takes as input [a directory containing json files](./data) (which adheres to [these types](./src/types.ts)): 
```
./data/user.json
    {
      "name": "User",
      "fields": [
        { "name": "id", "type": "string", "required": true },
        { "name": "username", "type": "string", "required": true },
        { "name": "email", "type": "email", "required": true },
        { "name": "createdAt", "type": "date" }
      ]
    }

./data/product.json
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