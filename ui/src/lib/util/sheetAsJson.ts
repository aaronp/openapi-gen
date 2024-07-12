import { SchemaFieldTypeEnum, type Row, type Spreadsheet } from "$lib/generated";

function asRecord(row : Row) {
    return row.cells.reduce((acc, cell) => {
        if (cell.type.type == SchemaFieldTypeEnum.AnyOf) {
            acc[cell.type.name] = cell.values
        } else {
            acc[cell.type.name] = cell.value
        }
        return acc;
    }, {} as { [key: string]: any })
}
export function sheetAsJson(sheet : Spreadsheet) {
    return sheet.rows.map(row => asRecord(row))
}