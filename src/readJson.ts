import * as path from 'path'
import * as fs from 'fs-extra'

export async function jsonArrayFromDir(directory: string): Promise<any[]> {
  try {
    // Read the contents of the directory
    const files = await fs.readdir(directory)

    // Filter out the JSON files
    const jsonFiles = files.filter(
      (file) => path.extname(file).toLowerCase() === '.json',
    )

    // Read the content of each JSON file and parse it
    const jsonContents = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(directory, file)
        const fileContent = await fs.readFile(filePath, 'utf-8')
        return JSON.parse(fileContent)
      }),
    )

    return jsonContents
  } catch (error) {
    console.error(`Error reading the directory or files: ${error}`)
    throw error
  }
}
