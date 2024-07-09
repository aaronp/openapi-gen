import fs from 'fs-extra'
import { Schema } from './types'
import { generateOpenApiSpec } from './generateOpenApi'
import yaml from 'js-yaml'
import { jsonArrayFromDir } from './readJson'

// Function to write the OpenAPI spec to a file
const writeOpenApiSpecToFile = async (spec: object) => {
  const yamlSpec = yaml.dump(spec)
  // fs.writeFileSync(filePath, yamlSpec)
  const outputFilePath = 'output/openapi.yaml'
  await fs.ensureDir('output')

  console.log('Writing OpenAPI spec to:', outputFilePath)
  fs.writeFileSync(outputFilePath, JSON.stringify(spec, null, 2), 'utf8')
  console.log(
    'Also Writing OpenAPI spec to output/openapi.yaml:',
    outputFilePath,
  )
  fs.writeFileSync('output/openapi.yaml', yamlSpec, 'utf8')
}

const dirFromArgs = () : string => {
  const args = process.argv.slice(2)
  if (args.length !== 1) {
    throw new Error(
      'Usage: Please provide as a single argument the path to the json source directory',
    )
  }
  return args[0]
}

const getSchemaFileNameFromArgs = async (dir : string): Promise<Schema[]> => {
  return await jsonArrayFromDir(dir) as Schema[]
}

const main = async () => {
  try {
    const dir = dirFromArgs()
    const schemas  = await getSchemaFileNameFromArgs(dir)
    const openApiSpec = generateOpenApiSpec(schemas)
    writeOpenApiSpecToFile(openApiSpec)

    console.log(yaml.dump(openApiSpec))
  } catch (error) {
    console.error('Error generating OpenAPI spec:', error)
  }
}

main()
