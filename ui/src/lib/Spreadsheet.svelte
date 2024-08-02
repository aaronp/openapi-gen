<script lang="ts">
	import type { Cell, Row, SchemaField, Spreadsheet } from '$lib/generated/index'
	import { api } from '$lib/session'
	import { SchemaFieldTypeEnum } from '$lib/generated/index'

	import { Button, SelectField, MultiSelectField, type MenuOption, Checkbox, TextField, Tooltip, Toggle, ResponsiveMenu, MenuItem } from 'svelte-ux'

	import { mdiArrowLeft, mdiArrowRight, mdiArrowUp, mdiArrowDown, mdiContentDuplicate, mdiCopyleft, mdiDelete, mdiPanLeft, mdiPencil, mdiPlus } from '@mdi/js'
	import { onMount } from 'svelte'
	
	type ColHeader = {
		width: number
		schema: SchemaField
	}

	const newSchema = (label: string): SchemaField => {
		return {
			name: label,
			type: SchemaFieldTypeEnum.Text,
			availableValues: []
		}
	}

	$: tableWidth = spreadsheet.columns.map((c) => c.width).reduce((acc, v) => acc + v, 0)

	let isResizing = false
	let currentColumn: ColHeader | null = null
	let startX = 0
	let startWidth = 0

	function handleMouseDown(event, col: ColHeader) {
		console.log('onMouseDown ', col)
		isResizing = true
		currentColumn = col
		startX = event.pageX
		startWidth = col.width
	}

	function handleMouseMove(event) {
		if (!isResizing || !currentColumn) return
		const dx = event.pageX - startX
		const newWidth = startWidth + dx
		currentColumn.width = Math.max(newWidth, 100)
		spreadsheet.columns = [...spreadsheet.columns]
	}

	function handleMouseUp() {
		isResizing = false
		currentColumn = null
	}

	let spreadsheet: Spreadsheet = {
		name: '',
		rows: [],
		columns: []
	}

	export let id

	onMount(async () => {
		await reloadSpreadsheet(id)
	})

	const newCell = (fieldName: string): Cell => {
		return {
			fieldName: fieldName,
			value: '', // ignore
			values: []
		}
	}

	function newRow(): Row {
		const cells = spreadsheet.columns.map((col) => newCell(col.schema.name))
		return { cells: cells }
	}

	const typeFor = (fieldName: string): SchemaField => spreadsheet.columns.find((c) => c.schema.name == fieldName)!

	async function reloadSpreadsheet(n: string) {
		spreadsheet = await api.getSpreadsheet({ name: n })
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

	function cellsForRow(row: Row) {
		return spreadsheet.columns.map((c, i) => [c, cellForRow(row, c, i)])
	}
	function cellForRow(row: Row, col: ColHeader, colIndex : number): Cell {
		const field = col.schema

		// TODO - use a different datastructure for this (a map on field names or else just re-order when the columns change)
		const cell = row.cells[colIndex]

		// the settings have changed since we last loaded the spreadsheet
		if (!cell) {
			const newCell = emptyCell(field)
			row.cells.push(newCell)
			return newCell
		} else {
			return cell
		}
	}
	const emptyCell = (field: SchemaField) => newCell(field.name)

	function onMultiselectChange({ detail }: CustomEvent, cell: Cell, rowIndex : number) {
		cell.values = detail.value
		cell.value = detail.value.join(',')

		onChange(cell, rowIndex)
	}

	function onChange(cell: Cell, rowIndex : number) {
		if (rowIndex == spreadsheet.rows.length - 1) {
			spreadsheet.rows = [...spreadsheet.rows, newRow()]
		}
		onSave()
	}
	async function onSave() {
		if (spreadsheet.name) {
			// pruneColumns(spreadsheet)

			await api.saveSpreadsheet({ spreadsheet })
		}
	}

	function removeRow(index: number) {
		spreadsheet.rows = spreadsheet.rows.filter((_, i) => i !== index)
		onSave()
	}

	function asOption(value: string): MenuOption {
		return { label: value, value: value }
	}
	function availableValues(cell: Cell) {
		const field = typeFor(cell.fieldName)
		// return (cell.type.availableValues ?? []).map((v) => asOption(v))
		return (field.availableValues ?? []).map((v) => asOption(v))
	}

	const onAddColumn = () => {
		spreadsheet.columns = [...spreadsheet.columns, { width : 200, schema : newSchema(`Col ${spreadsheet.columns.length}`)}]
	}
</script>

<svelte:window on:mousemove={handleMouseMove} on:mouseup={handleMouseUp} />

<h1>Sheet from page store: {id}</h1>
<!-- <pre>{JSON.stringify(spreadsheet, null, 2)}</pre> -->
<div>spreadsheet.rows {spreadsheet.rows.length}</div>

<div class="w-full overflow-auto p-1 border">
	<table class="border-collapse" style={`width: ${tableWidth}px;`}>
		<thead>
			{#if spreadsheet.rows.length > 0}
				<tr class="dark:bg-gray-800 bg-gray-200">
					<th></th>
					{#each spreadsheet.columns as col}
						<th class="border resizable-column" style={`width: ${col.width}px;`}>
							<div class="flex justify-between items-center">
								<Toggle let:on={open} let:toggle let:toggleOff>
									<Button on:click={toggle} class="w-full">
										<span>{col.schema.name}</span>
									  <ResponsiveMenu
										{open}
										on:close={toggleOff}
										menuProps={{ autoPlacement: true, matchWidth: true }}
									  >
									    <MenuItem><Button icon={mdiPencil} >Edit</Button></MenuItem>
										<MenuItem><Button icon={mdiArrowUp} >Sort Ascending</Button></MenuItem>
										<MenuItem><Button icon={mdiArrowDown} >Sort Descending</Button></MenuItem>
										<MenuItem><Button icon={mdiArrowRight} >Swap Right</Button></MenuItem>
										<MenuItem><Button icon={mdiArrowLeft} >Swap Left</Button></MenuItem>
										<MenuItem><Button icon={mdiContentDuplicate} >Duplicate</Button></MenuItem>
									  </ResponsiveMenu>
									</Button>
								  </Toggle>

								<div
									class="resizer dark:bg-gray-900 bg-gray-400"
									on:mousedown={(event) => handleMouseDown(event, col)}
								></div>
							</div>
						</th>
					{/each}
					<th><Button icon={mdiPlus} on:click={onAddColumn} /></th>
				</tr>
			{/if}
		</thead>
		<tbody>
			{#each spreadsheet.rows as row, rowIndex}
				<tr class="even:dark:bg-gray-500 even:bg-gray-100">
					<td><Button on:click={(e) => removeRow(rowIndex)} icon={mdiDelete}></Button></td>

					{#each cellsForRow(row) as [col, cell]}
						<td class="border p-2" style={`width: ${col.width}px;`}>
							<Tooltip title={cell.fieldName + '=' + JSON.stringify(cell.value)}>
								{@const typ = typeFor(cell.fieldName)}
								{#if typ === SchemaFieldTypeEnum.OneOf}
									<SelectField
										on:change={(e) => onChange(cell, rowIndex)}
										options={availableValues(cell)}
										bind:value={cell.value}
									/>
								{:else if typ === SchemaFieldTypeEnum.AnyOf}
									<MultiSelectField
										formatSelected={(e) => cell.value}
										rounded
										bind:label={cell.value}
										on:change={(e) => onMultiselectChange(e, cell, rowIndex)}
										options={availableValues(cell)}
										bind:value={cell.values}
									/>
								{:else if typ === SchemaFieldTypeEnum.Text}
									<TextField
										debounceChange
										on:change={(e) => onChange(cell, rowIndex)}
										multiline
										bind:value={cell.value}
										class=" rounded shadow-lg text-left text-lg  min-w-80"
									/>
								{:else if typ === SchemaFieldTypeEnum.Boolean}
									<Checkbox on:change={(e) => onChange(cell, rowIndex)} bind:checked={cell.value} />
								{:else}
									<TextField
										debounceChange
										on:change={(e) => onChange(cell, rowIndex)}
										bind:value={cell.value}
										class="bg-gray-100 dark:bg-gray-800 rounded shadow-sm text-left text-lg"
									/>
								{/if}
							</Tooltip>
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.resizable-column {
		position: relative;
		overflow: hidden;
	}
	.resizer {
		position: absolute;
		top: 0;
		right: 0;
		width: 5px;
		height: 100%;
		cursor: col-resize;
		user-select: none;
	}
</style>
