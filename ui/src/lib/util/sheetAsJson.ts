import { SchemaFieldTypeEnum, type Row, type Spreadsheet } from '$lib/generated'

export const toCamelCase = (input: string): string => {
	// Remove non-alphanumeric characters and split by space or underscore
	let words = input.replace(/[^a-zA-Z0-9 ]/g, '').split(/[\s_]+/)

	// Convert the first word to lowercase
	let camelCaseString = words[0].toLowerCase()

	// Capitalize the first letter of each subsequent word and append it to the result
	for (let i = 1; i < words.length; i++) {
		camelCaseString += words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase()
	}

	return camelCaseString
}

function asRecord(row: Row) {
	return row.cells.reduce(
		(acc, cell) => {
			const key = toCamelCase(cell.fieldName)
			acc[key] = cell.fieldName == SchemaFieldTypeEnum.AnyOf ? cell.values : cell.value
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
	return rows.map((row) => asRecord(row))
}
