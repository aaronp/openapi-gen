import fs from 'fs-extra';
import { Schema } from './types';
import { generateOpenApiSpec, writeOpenApiSpecToFile } from './generateOpenApi';

const schemaFilePath = 'schema.json';
const outputFilePath = 'openapi.json';

const main = async () => {
  try {
    const schema: Schema = await fs.readJson(schemaFilePath);
    const openApiSpec = generateOpenApiSpec(schema);
    writeOpenApiSpecToFile(openApiSpec, outputFilePath);
    console.log(`OpenAPI spec has been written to ${outputFilePath}`);
  } catch (error) {
    console.error('Error generating OpenAPI spec:', error);
  }
};

main()