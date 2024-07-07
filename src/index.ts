import fs from 'fs-extra'
import { Schema } from './types'
import { generateOpenApiSpec } from './generateOpenApi'
import yaml from 'js-yaml'

// Function to write the OpenAPI spec to a file
const writeOpenApiSpecToFile = async (spec: object) => {
  const yamlSpec = yaml.dump(spec)
  // fs.writeFileSync(filePath, yamlSpec)
  const outputFilePath = 'output/openapi.yaml'
  await fs.ensureDir('output')

  fs.writeFileSync(outputFilePath, JSON.stringify(spec, null, 2), 'utf8')
  fs.writeFileSync('output/openapi.yaml', yamlSpec, 'utf8')
}

const getSchemaFileNameFromArgs = (): string => {
  const args = process.argv.slice(2)
  if (args.length !== 1) {
    throw new Error(
      'Please provide exactly one argument for the schema file path.',
    )
  }
  return args[0]
}

const main = async () => {
  try {
    const schemaFilePath = getSchemaFileNameFromArgs()
    const schemas: Schema[] = await fs.readJson(schemaFilePath)
    const openApiSpec = generateOpenApiSpec(schemas)
    writeOpenApiSpecToFile(openApiSpec)

    // console.log(JSON.stringify(openApiSpec, null, 2))
    console.log(yaml.dump(openApiSpec))
  } catch (error) {
    console.error('Error generating OpenAPI spec:', error)
  }
}

main()
