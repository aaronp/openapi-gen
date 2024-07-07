import { Schema, Field } from './types';
import fs from 'fs-extra';

const emailPattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';


// Function to transform a single field to its OpenAPI representation
const transformFieldToProperty = (field: Field): { [key: string]: any } => {
  let type: string;
  switch (field.type) {
    case 'string':
        return { [field.name]: { type : 'string' } }
    case 'email':
        return { [field.name]: { 
            type : 'string',
            format : 'email',
            pattern : emailPattern
         } }
    case 'ref':
        return { [field.name]: { type : 'string' } }
    case 'date':
        return { [field.name]: { 
            type : 'string',
            format: 'date-time'
        } }
    default:
        return { [field.name]: { type : 'string' } }
  }
  
};

// Function to transform fields array to OpenAPI properties object
const transformFieldsToProperties = (fields: Array<Field>): { [key: string]: any } => {
  return fields.map(transformFieldToProperty).reduce((acc, prop) => ({ ...acc, ...prop }), {});
};

const asIdentifier = (input: string) => input.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()


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
      [`/data/${asIdentifier(name)}/{id}`]: {
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
                    '$ref': `#/components/schemas/${name}`
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
