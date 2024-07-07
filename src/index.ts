import fs from 'fs-extra';
import { Schema } from './types';
import { generateOpenApiSpec, writeOpenApiSpecToFile } from './generateOpenApi';

// const schemaFilePath = 'schema.json';
const outputFilePath = 'openapi.json';

const getSchemaFileNameFromArgs = (): string => {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    throw new Error('Please provide exactly one argument for the schema file path.');
  }
  return args[0];
};

const main = async () => {
  try {
    const schemaFilePath = getSchemaFileNameFromArgs();
    const schema: Schema = await fs.readJson(schemaFilePath);
    const openApiSpec = generateOpenApiSpec(schema);
    writeOpenApiSpecToFile(openApiSpec, outputFilePath);
    console.log(`OpenAPI spec has been written to ${outputFilePath}`);
  } catch (error) {
    console.error('Error generating OpenAPI spec:', error);
  }
};

main()