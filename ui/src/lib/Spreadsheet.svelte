<script lang="ts">
    import type { Cell, Row, SchemaField, Spreadsheet } from '$lib/generated/index'
    import { api } from '$lib/session'
    import { SchemaFieldTypeEnum } from '$lib/generated/index'

	import { Button, SelectField, MultiSelectField, type MenuOption, Checkbox, TextField, Tooltip, Field } from 'svelte-ux'

    import { onMount } from 'svelte'
	import { mdiDelete } from '@mdi/js'
	import Sheet from './Sheet.svelte'


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

    const typeFor = (fieldName : string) : SchemaField => spreadsheet.columns.find((f) => f.name == fieldName) !
    async function reloadSpreadsheet(n : string) {
        
        spreadsheet = await api.getSpreadsheet({name : n})
        spreadsheet.rows.forEach((row) => {
            row.cells.forEach((cell) => {
                const fieldType = typeFor(cell.fieldName)
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


	function cellsForRow(row : Row) {
		return spreadsheet.columns.map((field) => {

            // TODO - use a different datastructure for this (a map on field names or else just re-order when the columns change)
			const cell = row.cells.find((c) => {
				if (c.fieldName === field.name) {
					return c
				}
			})

			// the settings have changed since we last loaded the spreadsheet
			if (!cell) {
				const newCell =  emptyCell(field)
				row.cells.push(newCell)
				return newCell
			} else {
				return cell
			}
		})
	}
	function emptyCell(field : SchemaField) : Cell {
		return { value: '', values: [], fieldName : field.name }
	}

	function onMultiselectChange({detail} : CustomEvent, cell : Cell) {
		cell.values = detail.value
		cell.value = detail.value.join(',')

		onChange(cell)
	}

	function onChange(cell : Cell) {
		onSave()
	}
	async function onSave() {
		if (spreadsheet.name) {
			// pruneColumns(spreadsheet)

			await api.saveSpreadsheet({ spreadsheet })
		}
	}
	
	function removeRow(index : number) {
		spreadsheet.rows = spreadsheet.rows.filter((_, i) => i !== index)
		onSave()
	}

	function asOption(value: string): MenuOption {
		return { label: value, value: value }
	}
	function availableValues(cell : Cell) {
		const field = typeFor(cell.fieldName)
		// return (cell.type.availableValues ?? []).map((v) => asOption(v)) 
		return (field.availableValues ?? []).map((v) => asOption(v))
	}

</script>
  
  <h1>Sheet from page store: {id}</h1>
  <pre>{JSON.stringify(spreadsheet, null, 2)}</pre>
  
  <hr />
  <Sheet />

  <hr />
  
<div class="p-2 h-[70vh]" style="overflow: auto">
	<table>
		<thead>
			{#if spreadsheet.rows.length > 0}
			<tr>
				<th>Action</th>
				{#each spreadsheet.columns as field}
					<th>{field.name}</th>
				{/each}
			</tr>
			{/if}
		</thead>
		<tbody>
			{#each spreadsheet.rows as row, rowIndex}
				<tr>
					<td><Button on:click={(e) => removeRow(rowIndex)} icon={mdiDelete}></Button></td>
					{#each cellsForRow(row) as cell}
						
						<td class="px-6 py-2 border-b border-gray-300 text-center min-w-40">

							<Tooltip title={cell.fieldName + "=" + JSON.stringify(cell.value)}>
                                {@const typ = typeFor(cell.fieldName)}
								{#if typ === SchemaFieldTypeEnum.OneOf}
									<SelectField on:change={(e) => onChange(cell)} options={availableValues(cell)} bind:value={cell.value}  />									
								{:else if typ === SchemaFieldTypeEnum.AnyOf}
									<MultiSelectField formatSelected={(e) => cell.value} rounded bind:label={cell.value}  on:change={(e) => onMultiselectChange(e, cell)} options={availableValues(cell)} bind:value={cell.values} />
								{:else if typ === SchemaFieldTypeEnum.Text}
									<TextField debounceChange on:change={(e) => onChange(cell)} multiline bind:value={cell.value} class=" rounded shadow-lg text-left text-lg  min-w-80" />
								{:else if typ === SchemaFieldTypeEnum.Boolean}
										<Checkbox on:change={(e) => onChange(cell)} bind:checked={cell.value} />
								{:else}
									<TextField debounceChange on:change={(e) => onChange(cell)}  bind:value={cell.value} class="bg-gray-100 dark:bg-gray-800 rounded shadow-sm text-left text-lg" />										
								{/if}
							</Tooltip>
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>

</div>