import fs from 'fs'
import path from 'path'
import type { Settings, Spreadsheet, Script, ScriptResult } from '../../lib/generated/models'

const DataDir = process.env.DATA_DIR || './data'
const OutputDir = process.env.OUTPUT_DIR || './output'

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
const settingsPath = () => path.join(dataDir(), 'settings.json')

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

export function readScript(filename: string): Settings {
	try {
		const fqn = filename.endsWith('.json') ? filename : `${filename}.json`
		const fullPath = path.join(scriptsDir(), fqn)
		return JSON.parse(fs.readFileSync(fullPath, 'utf-8'))
	} catch (e) {
		console.error('ERROR reading script', e)
		return {
			fields: []
		}
	}
}

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

const resultsPath = (filename: string) => path.join(outputDir(), filename)

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

export function renameSheet(name: string, newName: string): string {
	const oldPath = spreadsheetPath(name)
	const newPath = spreadsheetPath(newName)
	fs.renameSync(oldPath, newPath)
	console.log(`Renamed sheet from ${oldPath} to ${fs.realpathSync(newPath)}`)
	return newPath
}

export function readSettings(): Settings {
	try {
		return JSON.parse(fs.readFileSync(settingsPath(), 'utf-8'))
	} catch (e) {
		console.error('ERROR reading settings', e)
		return {
			fields: []
		}
	}
}

export function deleteScript(filename: string) {
	const fullPath = scriptsPath(filename)
	if (fs.existsSync(fullPath)) {
		console.log(`Deleting script ${fs.realpathSync(fullPath)}`)
		fs.rmSync(fullPath)
		return true
	} else {
		return false
	}
}

export function saveScript(filename: string, data: Script) {
	const fullPath = scriptsPath(filename)
	fs.writeFileSync(fullPath, JSON.stringify(data, null, 2))
	console.log('Saving script to ', fs.realpathSync(fullPath))
	return fullPath
}

export function renameScript(name: string, newName: string): string {
	const oldPath = scriptsPath(name)
	const newPath = scriptsPath(newName)
	fs.renameSync(oldPath, newPath)
	console.log(`Renamed script from ${oldPath} to ${fs.realpathSync(newPath)}`)
	return newPath
}
export function saveSettings(data: Settings) {
	const fqn = settingsPath()
	console.log(`Saving settings to ${fs.realpathSync(fqn)}`)
	fs.writeFileSync(fqn, JSON.stringify(data, null, 2))
}

export function saveSpreadsheet(data: Spreadsheet) {
	const fqn = spreadsheetPath(data.name)
	console.log(`Saving spreadsheet to ${fs.realpathSync(fqn)}`)
	fs.writeFileSync(fqn, JSON.stringify(data, null, 2))
}

export function saveResults(data: ScriptResult) {
	const fqn = resultsPath(data.name)
	console.log(`Saving results to ${fs.realpathSync(fqn)}`)
	fs.writeFileSync(fqn, data.content)
}
export function deleteSpreadsheet(name: string) {
	const fqn = spreadsheetPath(name)
	console.log(`Deleting spreadsheet ${fs.realpathSync(fqn)}`)
	fs.rmSync(fqn)
}
