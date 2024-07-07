import { Schema, Field } from './types'

const emailPattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'

// Function to transform a single field to its OpenAPI representation
const transformFieldToProperty = (field: Field): { [key: string]: any } => {
  
  switch (field.type) {
    case 'string':
      return { [field.name]: { type: 'string' } }
    case 'email':
      return {
        [field.name]: {
          type: 'string',
          format: 'email',
          pattern: emailPattern,
        },
      }
    case 'decimal':
      return {
        [field.name]: {
          type: 'number',
          format: 'double',
        },
      }
    case 'int':
      return {
        [field.name]: {
          type: 'integer',
          format: 'int64',
        },
      }
    case 'date':
      return {
        [field.name]: {
          type: 'string',
          format: 'date-time',
        },
      }
    default:
      return { [field.name]: { type: field.type } }
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
  return fields.filter((field) => field.required).map((field) => field.name)
}

const asIdentifier = (input: string) =>
  input.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()

function getRouteForName(name: string) {
  return {
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
                $ref: `#/components/schemas/${name}`,
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

    paths[`/data/${asIdentifier(name)}/{id}`] = getRouteForName(name)

    const properties = transformFieldsToProperties(fields)
    const requiredFields = getRequiredFields(fields)
    components.schemas[name] = {
      type: 'object',
      properties,
      required: requiredFields.length > 0 ? requiredFields : undefined,
    }
  })

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
