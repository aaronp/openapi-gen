import fs from 'fs'
import path from 'path'
import type { Settings, Spreadsheet } from '../../lib/generated/models'

export function dataDir(): string {
	fs.mkdirSync('data', { recursive: true })
	return 'data'
}
const settingsPath = () => path.join(dataDir(), 'settings.json')
function spreadsheetPath() {
	const settings = readSettings()
	return path.join(dataDir(), settings.filename)
}

export function readSpreadsheet(): Spreadsheet {
	const filename = spreadsheetPath()
	try {
		return JSON.parse(fs.readFileSync(filename, 'utf-8'))
	} catch (e) {
		console.error(`ERROR reading ${filename}`, e)
		return {
			rows: []
		}
	}
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

export function saveSpreadsheet(data: Spreadsheet) {
	fs.writeFileSync(spreadsheetPath(), JSON.stringify(data, null, 2))
}
