import { Schema, Field } from './types'

const emailPattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'

// Function to transform a single field to its OpenAPI representation
const transformFieldToProperty = (field: Field): { [key: string]: any } => {
  const fieldName = asIdentifier(field)
  switch (field.type) {
    case 'string':
      return { [fieldName]: { type: 'string' } }
    case 'email':
      return {
        [fieldName]: {
          type: 'string',
          format: 'email',
          pattern: emailPattern,
        },
      }
    case 'decimal':
      return {
        [fieldName]: {
          type: 'number',
          format: 'double',
        },
      }
    case 'int':
      return {
        [fieldName]: {
          type: 'integer',
          format: 'int64',
        },
      }
    case 'date':
      return {
        [fieldName]: {
          type: 'string',
          format: 'date-time',
        },
      }
    default:
      return { [fieldName]: { type: field.type } }
  }
}

// Function to transform fields array to OpenAPI properties object
const transformFieldsToProperties = (
  fields: Array<Field>,
): { [key: string]: any } => {
  return fields
    .map(transformFieldToProperty)
    .reduce((acc, prop) => ({ ...acc, ...prop }), {})
}

const getRequiredFields = (fields: Array<Field>): string[] => {
  return fields.filter((field) => field.required).map((field) => asIdentifier(field))
}

const getFieldNames = (fields: Array<Field>): string[] => {
  return fields.map((field) => asIdentifier(field))
}

const toCamelCase = (input: string) : string => {
  // Remove non-alphanumeric characters and split by space or underscore
  let words = input.replace(/[^a-zA-Z0-9 ]/g, '').split(/[\s_]+/);

  // Convert the first word to lowercase
  let camelCaseString = words[0].toLowerCase();

  // Capitalize the first letter of each subsequent word and append it to the result
  for (let i = 1; i < words.length; i++) {
      camelCaseString += words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
  }

  return camelCaseString;
}

const asIdentifier = (input: Field) => input?.fieldName ?? toCamelCase(input.name)
  
  // input.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()

const asTitleCase = (input: string) => input.replace(/[^a-zA-Z0-9]/g, '')

function queryRouteForName(name: string) {
  return {
    get: {
      summary: `List ${name} values`,
      operationId: `list${asTitleCase(name)}`,
      parameters: [
        {
          name: 'offset',
          in: 'query',
          required: false,
          schema: {
            type: 'integer',
          },
        },
        {
          name: 'limit',
          in: 'query',
          required: false,
          schema: {
            type: 'integer',
          },
        },
      ],
      responses: {
        '200': {
          description: `The get results for ${name}`,
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: `#/components/schemas/${asTitleCase(name)}`,
                },
              },
            },
          },
        },
      },
    },
    post: {
      summary: `Query ${name} values`,
      operationId: `query${asTitleCase(name)}`,
      parameters: [
        {
          name: 'offset',
          in: 'query',
          required: false,
          schema: {
            type: 'integer',
          },
        },
        {
          name: 'limit',
          in: 'query',
          required: false,
          schema: {
            type: 'integer',
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: `#/components/schemas/${asTitleCase(name)}Query`,
            },
          },
        },
      },
      responses: {
        '200': {
          description: `The query results for ${name}`,
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: `#/components/schemas/${asTitleCase(name)}`,
                },
              },
            },
          },
        },
      },
    },
  }
}

function getRouteForName(name: string) {
  return {
    get: {
      summary: `Get ${name} by ID`,
      operationId: `get${asTitleCase(name)}ById`,
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
                $ref: `#/components/schemas/${asTitleCase(name)}`,
              },
            },
          },
        },
      },
    },
  }
}

// Function to generate the OpenAPI spec
export const generateOpenApiSpec = (schemas: Schema[]) => {
  const paths: { [key: string]: any } = {}
  const components: { [key: string]: any } = { schemas: {} }

  schemas.forEach((schema) => {
    const { name, fields } = schema

    // const version = v ? `/${v}` : '0.0.1'

    // paths[`/data/${asIdentifier(name)}/${version}/{id}`] = getRouteForName(name)
    paths[`/data/${toCamelCase(name)}/{id}`] = getRouteForName(name)
    paths[`/data/${toCamelCase(name)}`] = queryRouteForName(name)

    const properties = transformFieldsToProperties(fields)

    // the schema for data type
    const requiredFields = getRequiredFields(fields)
    components.schemas[asTitleCase(name)] = {
      type: 'object',
      properties,
      required: requiredFields.length > 0 ? requiredFields : undefined,
    }

    // our fields
    components.schemas[`${asTitleCase(name)}Fields`] = {
      type: 'string',
      enum: getFieldNames(fields),
    }

    // the query schema for our POST query route
    components.schemas[`${asTitleCase(name)}Query`] = {
      type: 'object',
      properties: {
        field: {
          $ref: `#/components/schemas/${asTitleCase(name)}Fields`,
        },
        value: {
          type: 'string',
        },
        operation: {
          $ref: '#/components/schemas/Operation',
        },
      },
    }
  })

  // we have a single 'Operation' type for our query operations
  components.schemas[`Operation`] = {
    type: 'string',
    enum: ['contains', 'equal', 'gte', 'gt', 'lte', 'lt', 'notEqual', 'in'],
  }

  const openApiSpec = {
    openapi: '3.0.0',
    info: {
      title: `API`,
      version: '1.0.0',
    },
    paths,
    components,
  }

  return openApiSpec
}
