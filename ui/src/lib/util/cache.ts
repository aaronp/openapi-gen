import type { Row, Script } from '$lib/generated'
import { api } from '$lib/session'
import { sheetAsJson } from './sheetAsJson'

// the cache key for 'applies to all sheets', but as individual inputs
export const EverySheet = 'any sheet'
// the key for 'all the sheets' - e.g. an array of all the values
export const AllSheets = 'sheets'

export type StackElement = {
	key: string
	input: any | undefined
	script: Script
}

/**
 *
 * @returns all input sources
 */
export async function inputSources(currentScriptName: string | undefined) {
	const scripts = await scriptNames()
	const sheets = await sheetNames()

	const all = { label: 'All Sheets', value: AllSheets, group: 'Sheets' }
	const every = { label: 'Any Sheet', value: EverySheet, group: 'Sheets' }
	const individualSheets = sheets.map((s) => {
		return { label: s, value: s, group: 'Sheet' }
	})
	const individualScripts = scripts
		.filter((s) => s !== currentScriptName)
		.map((s) => {
			return { label: s, value: s, group: 'Script' }
		})

	return [all, every, ...individualSheets, ...individualScripts]
}

async function scriptNames() {
	return await api.listScripts()
}

async function sheetNames(): Promise<string[]> {
	return await api.listSpreadsheets()
}

const getStackTrace = () => new Error().stack || 'No stack trace available'

async function scriptForName(name: string): Promise<Script> {
	if (!name) {
		console.error('scriptForName called with no name', getStackTrace())
		return Promise.reject('scriptForName called with no name')
	}
	return await api.getScript({ name })
}

async function spreadsheetForName(sheetName: string): Promise<any> {
	const found = await api.getSpreadsheet({ name: sheetName })
	return sheetAsJson(found)
}

/**
 *
 * @returns all the sheet values
 */
async function sheetsArray() {
	const names = await sheetNames()
	const promises = names.map(async (name) => {
		const data = await spreadsheetForName(name)
		return { sheet: name, data }
	})
	return await Promise.all(promises)
}

/**
 *
 * @param script the script to resolve
 * @returns the scripts which are required for this dependency
 */
export async function upstreamDependencies(script: Script, latestInput: any): Promise<StackElement[]> {
	if (script.input === AllSheets) {
		const result = await sheetsArray()
		const elm: StackElement = {
			key: script.input,
			input: result,
			script
		}
		return [elm]
	} else if (script.input === EverySheet) {
		const elm: StackElement = {
			key: script.input,
			input: latestInput,
			script
		}
		return [elm]
	} else {
		const names = await sheetNames()
		if (names.includes(script.input)) {
			const sheet = await spreadsheetForName(script.input)
			const elm: StackElement = {
				key: script.input,
				input: sheet,
				script
			}
			return [elm]
		} else if (script.input) {
			const upstream = await scriptForName(script.input)
			const array = await upstreamDependencies(upstream, latestInput)
			const elm: StackElement = {
				key: script.input,
				input: undefined,
				script
			}
			return [...array, elm]
		} else {
			const elm: StackElement = {
				key: script.input,
				input: undefined,
				script
			}
			return [elm]
		}
	}
}
