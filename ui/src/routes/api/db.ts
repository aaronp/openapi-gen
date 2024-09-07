import fs from 'fs'
import path from 'path'
import type { Spreadsheet, Script, ScriptResult, ScriptResultFilename } from '../../lib/generated/models'

const DataDir = process.env.DATA_DIR || './data'
const OutputDir = process.env.OUTPUT_DIR || './output'
const ImportDir = process.env.IMPORT_DIR || './imports'

const resolved = (name: string) => {
	if (fs.existsSync(name)) {
		return fs.realpathSync(name)
	} else {
		return name
	}
}

export function importDir(): string {
	fs.mkdirSync(ImportDir, { recursive: true })
	return ImportDir
}

export function dataDir(): string {
	fs.mkdirSync(DataDir, { recursive: true })
	return DataDir
}

export function outputDir(): string {
	fs.mkdirSync(OutputDir, { recursive: true })
	return OutputDir
}

function spreadsheetsDir(): string {
	const dir = path.join(dataDir(), 'spreadsheets')
	fs.mkdirSync(dir, { recursive: true })
	return dir
}

function scriptsDir(): string {
	const dir = path.join(dataDir(), 'scripts')
	fs.mkdirSync(dir, { recursive: true })
	return dir
}

export function saveData(dirname: string, filename: string, data: string | NodeJS.ArrayBufferView) {
	const saveDir = path.join(outputDir(), dirname)
	fs.mkdirSync(saveDir, { recursive: true })

	const fqn = path.join(saveDir, filename)
	fs.writeFileSync(fqn, data)
	return fqn
}

export function listSpreadsheets(): string[] {
	const dir = spreadsheetsDir()
	try {
		const files = fs.readdirSync(dir)

		// Filter out only JSON files and remove their extensions
		return files
			.filter((file) => path.extname(file).toLowerCase() === '.json')
			.map((file) => path.basename(file, '.json'))
	} catch (e) {
		console.error('ERROR reading spreadsheets: ', e)
		return []
	}
}

export function readScript(filename: string): Script {
	try {
		const fqn = filename.endsWith('.json') ? filename : `${filename}.json`
		const fullPath = path.join(scriptsDir(), fqn)
		return JSON.parse(fs.readFileSync(fullPath, 'utf-8'))
	} catch (e) {
		console.error('ERROR reading script', e)
		return {
			name: '',
			script: '',
			input: '',
			autoSave: false
		}
	}
}

export function readScriptImport(filename: string): string | undefined {
	try {
		const fullPath = path.join(importDir(), filename)
		return fs.readFileSync(fullPath, 'utf-8')
	} catch (e) {
		console.error('ERROR reading script import', e)
		return undefined
	}
}


// export const readOutputContents = (fileName : string): string | undefined => readPath(path.join(outputDir(), fileName))

export const readOutputContentsForSheet = (baseDir : string, fileName : string): string | undefined => readPath(path.join(outputDir(), baseDir, fileName))

function readPath(fqpath : string): string | undefined {
	if (fs.existsSync(fqpath)) {
		return fs.readFileSync(fqpath, 'utf-8')
	} 
	return undefined
}

export function listScriptResults(): ScriptResultFilename[] {
	try {
		const filesAndDirs = fs.readdirSync(outputDir())
		const results : ScriptResultFilename[] = filesAndDirs
		.flatMap((fileOrDir) => {
			const fqpath = path.join(outputDir(), fileOrDir)
			const stats = fs.statSync(fqpath)
			if (stats.isDirectory()) {
				
				const children : ScriptResultFilename[] = fs.readdirSync(fqpath).map((file) => {
					return {
						inputSpreadsheet : fileOrDir.toString(),
						outputFilename : file.toString()
					}
				})
				return children
			} else if (stats.isFile()) {
				return [{
					inputSpreadsheet : undefined,
					outputFilename : fileOrDir.toString()
				}]
			} else {
				return [{
					inputSpreadsheet : `Error - ${fileOrDir} is neither a file nor a dir`,
					outputFilename : `Error - ${fileOrDir} is neither a file nor a dir`
				}]
			}
		})
		return results
	} catch (e) {
		console.error('ERROR reading script outputs', e)
		return []
	}
}


export function listScriptResultsForSheet(sheetName : string): string[] {
	try {
		const fqpath = path.join(outputDir(), sheetName)
		const stats = fs.statSync(fqpath)
		return stats.isDirectory() ? fs.readdirSync(fqpath).map((file) => file.toString()) : []
	} catch (e) {
		console.error('ERROR reading script outputs for ' + sheetName, e)
		return []
	}
}

/**
 * @returns all the scripts which are available
 */
export function listScripts(): string[] {
	try {
		const files = fs.readdirSync(scriptsDir())
		return files
			.filter((file) => path.extname(file).toLowerCase() === '.json')
			.map((file) => path.basename(file, '.json'))
	} catch (e) {
		console.error('ERROR reading scripts', e)
		return []
	}
}

function spreadsheetPath(filename: string) {
	const fqn = filename.endsWith('.json') ? filename : `${filename}.json`
	return path.join(spreadsheetsDir(), fqn)
}

const resultsPath = (dir: string | undefined, filename: string) => {
	if (dir) {
		const saveDir = path.join(outputDir(), dir)
		fs.mkdirSync(saveDir, { recursive: true })
		return path.join(saveDir, filename)
	} else {
		return path.join(outputDir(), filename)
	}
}

const scriptsPath = (filename: string) =>
	path.join(scriptsDir(), filename.endsWith('.json') ? filename : `${filename}.json`)

export function readSpreadsheet(name: string): Spreadsheet {
	const filename = spreadsheetPath(name)
	try {
		return JSON.parse(fs.readFileSync(filename, 'utf-8'))
	} catch (e) {
		console.error(`ERROR reading ${filename}`, e)
		return {
			name: '',
			rows: []
		}
	}
}

export function copySheet(name: string, newName: string): string {
	const renamed = readSpreadsheet(name)
	renamed.name = newName
	const newPath = saveSpreadsheet(renamed)

	console.log(`Copied sheet from ${name} to ${resolved(newPath)}`)
	return newPath
}
export function renameSheet(name: string, newName: string): string {
	const newPath = copySheet(name, newName)
	deleteSpreadsheet(name)

	console.log(`Renamed sheet from ${name} to ${resolved(newPath)}`)
	return newPath
}

export function deleteScript(filename: string) {
	const fullPath = scriptsPath(filename)
	if (fs.existsSync(fullPath)) {
		console.log(`Deleting script ${resolved(fullPath)}`)
		fs.rmSync(fullPath)
		return true
	} else {
		return false
	}
}

export function saveScript(filename: string, data: Script) {
	const fullPath = scriptsPath(filename)
	fs.writeFileSync(fullPath, JSON.stringify(data, null, 2))
	console.log('Saving script to ', resolved(fullPath))
	return fullPath
}

export function renameScript(name: string, newName: string): string {
	// ensure the name is consistent w/ the filename
	const script = readScript(name)
	script.name = newName
	const newPath = saveScript(newName, script)
	deleteScript(name)

	console.log(`Renamed script from ${name} to ${resolved(newPath)}`)
	return newPath
}

export function saveSpreadsheet(data: Spreadsheet) {
	const fqn = spreadsheetPath(data.name)
	console.log(`Saving spreadsheet to ${resolved(fqn)}`)
	fs.writeFileSync(fqn, JSON.stringify(data, null, 2))
	return fqn
}

export function saveResults(data: ScriptResult) {
	const fqn = resultsPath(data.dir, data.name)
	console.log(`Saving results to ${resolved(fqn)}`)
	fs.writeFileSync(fqn, data.content)
}
export function deleteSpreadsheet(name: string) {
	const fqn = spreadsheetPath(name)
	console.log(`Deleting spreadsheet ${resolved(fqn)}`)
	fs.rmSync(fqn)
}
