import { SchemaFieldTypeEnum, type Cell, type Column, type Row, type Spreadsheet } from '$lib/generated'
import { executeCodeWithInput } from './execute'
import { asIdentifier, toCamelCase } from './text'

function asRecord(sheet: Spreadsheet, indexByIdentifier: { [key: string]: number }, row: Row): { [key: string]: any } {
	return sheet.columns.reduce(
		(acc, col, i) => {
			const key = toCamelCase(col.schema.name)
			acc[key] = valueOfCol(sheet, indexByIdentifier, row, i)
			return acc
		},
		{} as { [key: string]: any }
	)
}

/**
 * @param sheet the sheet to turn into a JSON object
 * @returns the JSON object
 */
export function sheetAsJson(spreadsheet: Spreadsheet): { [key: string]: any }[] {
	const indexByIdentifier = colIndexByIdentifier(spreadsheet)
	return calcSheetAsJson(spreadsheet, indexByIdentifier)
}

export function calcSheetAsJson(spreadsheet: Spreadsheet, indexByIdentifier : { [key: string]: number }): { [key: string]: any }[] {
	const rows = spreadsheet?.rows || []
	return rows.map((row) => asRecord(spreadsheet, indexByIdentifier, row))
}

export function valueOfCol(
	spreadsheet: Spreadsheet,
	indexByIdentifier: { [key: string]: number },
	row: Row,
	idx: number
) {
	try {
		const col = spreadsheet.columns[idx]
		const typ = col.schema.type
		const cell: Cell = row.cells[idx]

		if (typ === SchemaFieldTypeEnum.Script) {
			return execScript(spreadsheet, indexByIdentifier, row, col)
		} else if (typ === SchemaFieldTypeEnum.AnyOf || typ === SchemaFieldTypeEnum.OneOf) {
			return cell.values
		}
		return cell.value ?? cell.values
	} catch (e) {
		return `error getting col ${idx} : ${e}`
	}
}

/**
 * @return a map of the column index by the column name identifier (i.e. if the second column 'Foo Bar' corresponds to an entry of 'fooBar' -> 1 )
 */
export function colIndexByIdentifier(spreadsheet: Spreadsheet): { [key: string]: number } {
	const stringToIndexMap: { [key: string]: number } = {}
	spreadsheet.columns.forEach((c, i) => {
		const key = asIdentifier(c.schema.name)
		stringToIndexMap[key] = i
	})
	return stringToIndexMap
}

export function valueOf(spreadsheet: Spreadsheet, indexByIdentifier: { [key: string]: number }, row: Row, key: string) {
	try {
		const idx = indexByIdentifier[key]
		return valueOfCol(spreadsheet, indexByIdentifier, row, idx)
	} catch (e) {
		return `error getting ${key} : ${e}`
	}
}

export function execScript(
	spreadsheet: Spreadsheet,
	indexByIdentifier: { [key: string]: number },
	row: Row,
	col: Column
) {
	try {
		const inputsMap = new Map<string, any>()

		col?.schema?.scriptInputs?.forEach((key) => {
			const value = valueOf(spreadsheet, indexByIdentifier, row, key)
			inputsMap.set(key, value)
		})

		// the script code is stored as an 'availableValues' in the column
		const script = col.schema.availableValues?.join('') ?? ''
		return executeCodeWithInput(script, inputsMap)
	} catch (e) {
		return 'execScript error: ' + e
	}
}
