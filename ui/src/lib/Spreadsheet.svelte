<script lang="ts">
    import type { Cell, Row, Spreadsheet } from '$lib/generated/index'
    import { api } from '$lib/session'
    import { SchemaFieldTypeEnum } from '$lib/generated/index'

    import { onMount } from 'svelte'

    let spreadsheet: Spreadsheet = {
        name :  '',
        rows: [],
        columns: []
    }

    export let id;
    
    onMount(async () => {
        await reloadSpreadsheet(id)
    });

    function newRow(): Row {
        const cells = spreadsheet.columns.map((field) => {
            const cell: Cell = {
                fieldName: field.name,
                value: '', // ignore
                values: []
            }
            return cell
        })
        return { cells: cells }
    }

    async function reloadSpreadsheet(n : string) {
        
        spreadsheet = await api.getSpreadsheet({name : n})
        spreadsheet.rows.forEach((row) => {
            row.cells.forEach((cell) => {
                const fieldType = spreadsheet.columns.find((f) => f.name == cell.fieldName)
                if (fieldType?.type === SchemaFieldTypeEnum.AnyOf) {
                    if (!cell.value) {
                        // ignore
                        cell.value = (cell?.values ?? []).join(',')
                    }
                }
            })
        })

        // always add a "next row" empty row at the bottom
        spreadsheet.rows = [...spreadsheet.rows, newRow()]

        
    }
</script>
  
  <h1>Sheet from page store: {id}</h1>
  <pre>{JSON.stringify(spreadsheet, null, 2)}</pre>
  