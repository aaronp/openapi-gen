<script lang="ts">
	import type { Cell, Row, SchemaField, Spreadsheet, Column } from '$lib/generated/index'
	import { api } from '$lib/session'
	import { SchemaFieldTypeEnum } from '$lib/generated/index'
	import ColHeader from '$lib/ColHeader.svelte'

	import { Button, SelectField, MultiSelectField, type MenuOption, Checkbox, TextField, Tooltip } from 'svelte-ux'

	import { mdiDelete, mdiPlus, mdiArrowDownThin, mdiArrowUpThin } from '@mdi/js'
	import { onMount } from 'svelte'

	const newSchema = (label: string): SchemaField => {
		return {
			name: label,
			type: SchemaFieldTypeEnum.Text,
			availableValues: []
		}
	}

	$: tableWidth = spreadsheet.columns.map((c) => c.width).reduce((acc, v) => acc + v, 0)

	// the ID of the spreadsheet
	export let id

	// used for dragging columns
	let isResizing = false
	let currentColumn: Column | null = null
	let startX = 0
	let startWidth = 0

	function handleMouseDown(event, col: Column) {
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
		if (isResizing) {
			isResizing = false
			currentColumn = null
			onSave()
		}
	}

	let spreadsheet: Spreadsheet = {
		name: '',
		rows: [],
		columns: []
	}

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
		return { cells: cells.length == 0 ? [...cells, newCell('Col 1')] : cells }
	}

	async function reloadSpreadsheet(n: string) {
		spreadsheet = await api.getSpreadsheet({ name: n })
		spreadsheet.rows.forEach((row) => {
			row.cells.forEach((cell, i) => {
				const fieldType = spreadsheet.columns[i].schema
				if (fieldType?.type === SchemaFieldTypeEnum.AnyOf) {
					if (!cell.value) {
						// ignore
						cell.value = (cell?.values ?? []).join(',')
					}
				}
			})
		})

		// always add a "next row" empty row at the bottom
		if (spreadsheet.rows.length == 0) {
			spreadsheet.rows = [...spreadsheet.rows, newRow()]
		}
	}

	function cellsForRow(row: Row) {
		return spreadsheet.columns.map((c, i) => [c, cellForRow(row, c, i)])
	}
	function cellForRow(row: Row, col: Column, colIndex: number): Cell {
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

	function onMultiselectChange({ detail }: CustomEvent, cell: Cell, rowIndex: number) {
		cell.values = detail.value
		cell.value = detail.value.join(',')

		onChange(cell, rowIndex)
	}

	const isEmpty = (row: Row) => {
		const hasAValue = row.cells.some((c) => {
			c.value || (c.values?.length ?? 0 > 0) ? true : false
		})
		console.log(JSON.stringify(row), ' has a value: ', hasAValue)
		return !hasAValue
	}

	function onChange(cell: Cell, rowIndex: number) {
		if (rowIndex == spreadsheet.rows.length - 1) {
			spreadsheet.rows = [...spreadsheet.rows, newRow()]
		}
		onSave()
	}
	async function onSave() {
		if (spreadsheet.name) {
			// const nonEmpty = spreadsheet.rows.filter((r) => !isEmpty(r))
			// spreadsheet.rows = nonEmpty
			await api.saveSpreadsheet({ spreadsheet })
		}
	}

	function focusElement(cellId: string) {
		const parentElement = document.getElementById(cellId)
		parentElement?.querySelector('input')?.focus()
	}

	function onFieldKeyDown(event, rowIndex, colIndex) {
		if (event.key === 'ArrowDown') {
			focusElement(`cell-${rowIndex + 1}-${colIndex}`)
		} else if (event.key === 'ArrowUp') {
			focusElement(`cell-${rowIndex - 1}-${colIndex}`)
		}
	}

	function removeRow(index: number) {
		spreadsheet.rows = spreadsheet.rows.filter((_, i) => i !== index)
		onSave()
	}

	function asOption(value: string): MenuOption {
		return { label: value, value: value }
	}
	function availableValues(cell: Cell, field: SchemaField) {
		// return (cell.type.availableValues ?? []).map((v) => asOption(v))
		return (field.availableValues ?? []).map((v) => asOption(v))
	}

	const onAddColumn = () => {
		spreadsheet.columns = [
			...spreadsheet.columns,
			{ width: 200, schema: newSchema(`Col ${spreadsheet.columns.length + 1}`) }
		]
	}

	function onColumnSort(col: Column, ascending: boolean) {}

	function onMoveLeft(col: Column, colIndex: number) {
		if (colIndex > 0) {
			swap(colIndex, colIndex - 1)
		}
	}
	function swapArray<A>(values : A[], col1: number, col2: number) {
		const c = values[col1]
		values[col1] = values[col2]
		values[col2] = c
	}

	function swap(col1: number, col2: number) {
		swapArray(spreadsheet.columns, col1, col2)
		spreadsheet.rows.forEach((row) => {
			swapArray(row.cells, col1, col2)
		})
		spreadsheet = spreadsheet
		onSave()
	}
	function onMoveRight(col: Column, colIndex: number) {
		if (colIndex < spreadsheet.columns.length - 1) {
			swap(colIndex, colIndex + 1)
		}
	}
	function onSchemaUpdated(newSchema: SchemaField, col: Column) {
		onSave()
	}
</script>

<!-- needed for column drag -->
<svelte:window on:mousemove={handleMouseMove} on:mouseup={handleMouseUp} />

<svelte:head>
	<title>{spreadsheet.name}</title>
</svelte:head>

<div class="w-full overflow-auto p-1 border">
	<table class="border-collapse" style={`width: ${tableWidth}px;`}>
		<thead>
			{#if spreadsheet.rows.length > 0}
				<tr class="dark:bg-gray-800 bg-gray-200">
					<th></th>
					{#each spreadsheet.columns as col, colIndex}
						<th class="border resizable-column" style={`width: ${col.width}px;`}>
							<div class="flex justify-between items-center">
								<span class="w-full">
									<ColHeader
										schema={col.schema}
										on:moveRight={(e) => onMoveRight(col, colIndex)}
										on:moveLeft={(e) => onMoveLeft(col, colIndex)}
										on:schemaUpdated={(e) => onSchemaUpdated(e.detail, col)}
									/>
								</span>
								<span class="w-12 opacity-25">
									<Button icon={mdiArrowDownThin} on:click={(e) => onColumnSort(col, true)}></Button>
								</span>
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
				<tr class="even:dark:bg-gray-900 even:bg-gray-100">
					<td><Button on:click={(e) => removeRow(rowIndex)} icon={mdiDelete}></Button></td>

					{#each cellsForRow(row) as [col, cell], colIndex}
						<td id="cell-{rowIndex}-{colIndex}" class="border p-2" style={`width: ${col.width}px;`}>
							<Tooltip title={col.schema.name + '=' + JSON.stringify(cell.value) + '[' + col.schema.type + ']'}>
								{@const typ = col.schema}
								
								{#if typ === SchemaFieldTypeEnum.OneOf}
									<SelectField
										on:change={(e) => onChange(cell, rowIndex)}
										options={availableValues(cell, typ)}
										bind:value={cell.value}
									/>
								{:else if typ === SchemaFieldTypeEnum.AnyOf}
									<MultiSelectField
										formatSelected={(e) => cell.value}
										rounded
										bind:label={cell.value}
										on:change={(e) => onMultiselectChange(e, cell, rowIndex)}
										options={availableValues(cell, typ)}
										bind:value={cell.values}
									/>
								{:else if typ === SchemaFieldTypeEnum.Text}
									<TextField
										debounceChange
										on:change={(e) => onChange(cell, rowIndex)}
										on:keydown={(e) => onFieldKeyDown(e, rowIndex, colIndex)}
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
										on:keydown={(e) => onFieldKeyDown(e, rowIndex, colIndex)}
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
