import { SchemaFieldTypeEnum, type Row, type Spreadsheet } from '$lib/generated'
import { toCamelCase } from './text'

function asRecord(sheet: Spreadsheet, row: Row) {
	return sheet.columns.reduce(
		(acc, col, i) => {
			const cell = row.cells[i]
			const key = toCamelCase(col.schema.name)
			acc[key] = col.schema.type === SchemaFieldTypeEnum.AnyOf ? cell.values : cell.value
			return acc
		},
		{} as { [key: string]: any }
	)
}

/**
 * @param sheet the sheet to turn into a JSON object
 * @returns the JSON object
 */
export function sheetAsJson(sheet: Spreadsheet): { [key: string]: any }[] {
	const rows = sheet?.rows || []
	return rows.map((row) => asRecord(sheet, row))
}
