import fs from 'fs'
import path from 'path'
import type { Settings, Spreadsheet } from '../../lib/generated/models'

export function dataDir(): string {
	fs.mkdirSync('data', { recursive: true })
	return 'data'
}
const settingsPath = () => path.join(dataDir(), 'settings.json')

export function listSpreadsheets(): string[] {
	const dir = path.join('data', 'spreadsheets')
	try {
		const files = fs.readdirSync(dir)

		// Filter out only JSON files and remove their extensions
		return files
			.filter((file) => path.extname(file).toLowerCase() === '.json')
			.map((file) => path.basename(file, '.json'))
	} catch (e) {
		console.log('ERROR reading spreadsheets', e)
		return []
	}
}

function spreadsheetPath(filename: string) {
	const dir = path.join('data', 'spreadsheets')
	fs.mkdirSync(dir, { recursive: true })
	const fqn = filename.endsWith('.json') ? filename : `${filename}.json`
	return path.join(dir, fqn)
}

export function readSpreadsheet(name: string): Spreadsheet {
	const filename = spreadsheetPath(name)
	try {
		return JSON.parse(fs.readFileSync(filename, 'utf-8'))
	} catch (e) {
		console.error(`ERROR reading ${filename}`, e)
		return {
			rows: []
		}
	}
}

export function renameSheet(name: string, newName: string): string {
	const oldPath = spreadsheetPath(name)
	const newPath = spreadsheetPath(newName)
	fs.renameSync(oldPath, newPath)
	return newPath
}

export function readSettings(): Settings {
	try {
		return JSON.parse(fs.readFileSync(settingsPath(), 'utf-8'))
	} catch (e) {
		console.error('ERROR reading settings', e)
		return {
			filename: 'data.json',
			urlPrefix: '/api',
			fields: []
		}
	}
}

export function saveSettings(data: Settings) {
	fs.writeFileSync(settingsPath(), JSON.stringify(data, null, 2))
}

export function saveData(dir : string, filename : string, data: string | NodeJS.ArrayBufferView) {
	const saveDir = path.join(dataDir(), dir)
	fs.mkdirSync(saveDir, { recursive: true })

	const fqn = path.join(saveDir, filename)
	fs.writeFileSync(fqn, data)
	return fqn
}

export function saveSpreadsheet(name: string, data: Spreadsheet) {
	fs.writeFileSync(spreadsheetPath(name), JSON.stringify(data, null, 2))
}

export function deleteSpreadsheet(name: string) {
	fs.rmSync(spreadsheetPath(name))
}
