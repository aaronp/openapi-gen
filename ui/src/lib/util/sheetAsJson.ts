import { SchemaFieldTypeEnum, type Row, type Spreadsheet } from '$lib/generated'
import { toCamelCase } from '$lib/openapi/generateOpenApi'

function asRecord(row: Row) {
	return row.cells.reduce(
		(acc, cell) => {
			const key = toCamelCase(cell.type.name)
			acc[key] = cell.type.type == SchemaFieldTypeEnum.AnyOf ? cell.values : cell.value
			return acc
		},
		{} as { [key: string]: any }
	)
}

export function sheetAsJson(sheet: Spreadsheet) {
	console.log('sheet.rows is ', sheet.rows)
	const rows = sheet?.rows || []
	return rows.map((row) => asRecord(row))
}
