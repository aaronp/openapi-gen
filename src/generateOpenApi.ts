import { Schema, Field } from './types';
import fs from 'fs-extra';

// Function to transform a single field to its OpenAPI representation
const transformFieldToProperty = (field: Field): { [key: string]: any } => {
  let type: string;
  switch (field.type) {
    case 'string':
    case 'email':
    case 'ref':
      type = 'string';
      break;
    case 'date':
      type = 'string';
      break;
    default:
      type = 'string';
  }
  return { [field.name]: { type } };
};

// Function to transform fields array to OpenAPI properties object
const transformFieldsToProperties = (fields: Array<Field>): { [key: string]: any } => {
  return fields.map(transformFieldToProperty).reduce((acc, prop) => ({ ...acc, ...prop }), {});
};

// Function to generate the OpenAPI spec
export const generateOpenApiSpec = (schema: Schema) => {
  const { name, fields } = schema;
  const properties = transformFieldsToProperties(fields);

  const openApiSpec = {
    openapi: '3.0.0',
    info: {
      title: `${name} API`,
      version: '1.0.0',
    },
    paths: {
      [`/data/${name}/{id}`]: {
        get: {
          summary: `Get ${name} by ID`,
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
              },
            },
          ],
          responses: {
            '200': {
              description: `A ${name}`,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties,
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        [name]: {
          type: 'object',
          properties,
        },
      },
    },
  };

  return openApiSpec;
};

// Function to write the OpenAPI spec to a file
export const writeOpenApiSpecToFile = (spec: object, filePath: string) => {
  fs.writeFileSync(filePath, JSON.stringify(spec, null, 2));
};
