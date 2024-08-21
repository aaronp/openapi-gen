<script lang="ts">
	import type { Cell, Row, SchemaField, Spreadsheet, Column } from '$lib/generated/index'
	import { SchemaFieldTypeEnum, SortingDirectionEnum } from '$lib/generated/index'
	import ColHeader from '$lib/ColHeader.svelte'

	import { latestSheet, api } from '$lib/session'
	import {
		Button,
		SelectField,
		MultiSelectField,
		type MenuOption,
		Checkbox,
		TextField,
		Tooltip
	} from 'svelte-ux'

	import { mdiDelete, mdiPlus, mdiArrowDownThin, mdiArrowUpThin } from '@mdi/js'
	import { onMount } from 'svelte'
	import { executeCodeWithInput } from './util/execute'
	import { asIdentifier } from './util/text'

	const newSchema = (label: string): SchemaField => {
		return {
			name: label,
			type: SchemaFieldTypeEnum.String,
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

	// a cache of the columns indexes by the column identifiers
	let indexByIdentifier: { [key: string]: number } = {}


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

	const newCell = (): Cell => {
		return {
			value: '', // ignore
			values: []
		}
	}

	function newRow(): Row {
		const cells = spreadsheet.columns.map((col) => newCell())
		return { cells: cells.length == 0 ? [...cells, newCell()] : cells }
	}

	async function reloadSpreadsheet(n: string) {
		spreadsheet = await api.getSpreadsheet({ name: n })

		console.log('setting latest to ', id)
		latestSheet.set(spreadsheet)

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


		indexByIdentifier = colIndexByIdentifier()
	}

	function cellsForRow(row: Row) {
		return spreadsheet.columns.map((c, i) => [c, cellForRow(row, c, i)])
	}
	function cellForRow(row: Row, col: Column, colIndex: number): Cell {
		const cell = row.cells[colIndex]

		// the settings have changed since we last loaded the spreadsheet
		if (!cell) {
			const newCell = emptyCell()
			row.cells.push(newCell)
			return newCell
		} else {
			return cell
		}
	}
	const emptyCell = () => newCell()

	function onMultiselectChange({ detail }: CustomEvent, cell: Cell, rowIndex: number) {
		cell.values = detail.value
		cell.value = detail.value.join(',')

		onChange(cell, rowIndex)
	}

	const isEmpty = (row: Row) => {
		for (const c of row.cells) {
			if (c.value) {
				return false
			}
		}
		return true
	}

	function onChange(cell: Cell, rowIndex: number) {
		if (rowIndex == spreadsheet.rows.length - 1) {
			spreadsheet.rows = [...spreadsheet.rows, newRow()]
		}
		onSave()
	}
	async function onSave() {
		if (spreadsheet.name) {
			const nonEmpty = spreadsheet.rows.filter((r) => !isEmpty(r))
			const before = spreadsheet.rows


			// spreadsheet.rows = nonEmpty
			await api.saveSpreadsheet({ spreadsheet })
			// spreadsheet.rows = before

			// we may be renaming columns or all sorts
			indexByIdentifier = colIndexByIdentifier()
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
	function availableValues(field: SchemaField) {
		return (field.availableValues ?? []).map((v) => asOption(v))
	}

	const onAddColumn = () => {
		spreadsheet.columns = [
			{ width: 200, schema: newSchema(`Col${spreadsheet.columns.length + 1}`) },
			...spreadsheet.columns
		]
		spreadsheet.rows.forEach((r) => {
			r.cells = [emptyCell(), ...r.cells]
		})

		indexByIdentifier = colIndexByIdentifier()
	}

	const sortOpacity = (col: Column) => (col.schema.name === spreadsheet?.sort?.fieldName ? 'opacity-100' : 'opacity-25')

	const sortIcon = (col: Column) => {
		if (sortDirection(col) === SortingDirectionEnum.Ascending) {
			return mdiArrowUpThin
		} else {
			return mdiArrowDownThin
		}
	}

	const sortDirection = (col: Column) => {
		if (col.schema.name === spreadsheet?.sort?.fieldName) {
			return spreadsheet?.sort?.direction ?? SortingDirectionEnum.Descending
		}
		return SortingDirectionEnum.Descending
	}
	function onColumnSort(col: Column, colIndex: number) {
		var dir: SortingDirectionEnum = SortingDirectionEnum.Descending
		if (col.schema.name === spreadsheet?.sort?.fieldName) {
			dir =
				sortDirection(col) == SortingDirectionEnum.Ascending
					? SortingDirectionEnum.Descending
					: SortingDirectionEnum.Ascending
		}
		spreadsheet.sort = {
			fieldName: col.schema.name,
			direction: dir
		}

		const sorted = spreadsheet.rows
			.filter((r) => !isEmpty(r))
			.sort((a, b) => {

				const left = JSON.stringify(valueOfCol(a, colIndex))
				const right = JSON.stringify(valueOfCol(b, colIndex))
				// console.log(`${colIndex}: ${left} vs ${right}`)
				var result: number = left.localeCompare(right)
				if (dir == SortingDirectionEnum.Ascending) {
					result = result * -1
				}
				return result
			})

		const size = sorted.length
		if (size > 0 && !isEmpty(sorted[size - 1])) {
			spreadsheet.rows = [...sorted, newRow()]
		} else {
			spreadsheet.rows = sorted
		}
	}

	function onMoveLeft(col: Column, colIndex: number) {
		if (colIndex > 0) {
			swap(colIndex, colIndex - 1)
		}
	}
	function swapArray<A>(values: A[], col1: number, col2: number) {
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
	function onDeleteColumn(col: Column, colIndex: number) {
		spreadsheet.columns.splice(colIndex, 1)
		spreadsheet.rows.forEach((row) => {
			row.cells.splice(colIndex, 1)
		})
		spreadsheet = spreadsheet
		onSave()
	}
	function onSchemaUpdated(newSchema: SchemaField, col: Column) {
		spreadsheet = spreadsheet
		onSave()
	}

	/**
	 * @return a map of the column index by the column name identifier (i.e. if the second column 'Foo Bar' corresponds to an entry of 'fooBar' -> 1 )
	 */
	function colIndexByIdentifier() {
		const stringToIndexMap: { [key: string]: number } = {};
		spreadsheet.columns.forEach((c, i) => {
			const key = asIdentifier(c.schema.name)
			stringToIndexMap[key] = i
		})
		return stringToIndexMap
	}

	/**
	 * Our script cells need to gather their inputs (other cells in the row), 
	 * and those cells may in turn be scripts (so we have to recurse)
	 * 
	 * @param row
	 * @param key
	 */
	function valueOf(row: Row, key : string) {
		try {
			const idx = indexByIdentifier[key]
			return valueOfCol(row, idx)
		} catch (e) {
			return `error getting ${key} : ${e}`
		}
	}

	function valueOfCol(row: Row, idx : number) {
		try {
			const col = spreadsheet.columns[idx]
			const typ = col.schema.type
			const cell : Cell = row.cells[idx]

			if (typ === SchemaFieldTypeEnum.Script) {
				return execScript(row, col, cell)
			} else if (typ === SchemaFieldTypeEnum.AnyOf || typ === SchemaFieldTypeEnum.OneOf) {
				return cell.values
			}
			return cell.value ?? cell.values
		} catch (e) {
			return `error getting col ${idx} : ${e}`
		}
	}

	function execScript(row : Row, col : Column, cell : Cell) {
		try {
			const inputsMap = new Map<string, any>()

			col?.schema?.scriptInputs?.forEach((key) => {
				const value = valueOf(row, key)
				inputsMap.set(key, value)
			})
			
			// the script code is stored as an 'availableValues' in the column
			const script = col.schema.availableValues?.join('') ?? ''
			return executeCodeWithInput(script, inputsMap)
		} catch (e) {
			return 'execScript error: ' + e
		}
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
					<th><Tooltip title="Add Column"><Button icon={mdiPlus} on:click={onAddColumn} /></Tooltip></th>
					
					{#each spreadsheet.columns as col, colIndex}
						<th class="border resizable-column" style={`width: ${col.width}px;`}>
							<div class="flex justify-between items-center">
								<span class="w-full">
									{#key col}
										<ColHeader
											hasLeft={colIndex > 0}
											hasRight={colIndex < spreadsheet.columns.length - 1}
											schema={col.schema}
											columns={spreadsheet.columns.filter(c => c != col)}
											on:delete={(e) => onDeleteColumn(col, colIndex)}
											on:moveRight={(e) => onMoveRight(col, colIndex)}
											on:moveLeft={(e) => onMoveLeft(col, colIndex)}
											on:schemaUpdated={(e) => onSchemaUpdated(e.detail, col)}
										/>
									{/key}
								</span>
								{#if col.schema.type !== SchemaFieldTypeEnum.Script}
									<span class="w-12 {sortOpacity(col)}">
										<Button icon={sortIcon(col)} on:click={(e) => onColumnSort(col, colIndex)}></Button>
									</span>
								{/if}
								<div
									class="resizer dark:bg-gray-900 bg-gray-400"
									on:mousedown={(event) => handleMouseDown(event, col)}
								></div>
							</div>
						</th>
					{/each}
				</tr>
			{/if}
		</thead>
		<tbody>
			{#each spreadsheet.rows as row, rowIndex}
				<tr class="even:dark:bg-gray-900 even:bg-gray-100">
					<td><Button on:click={(e) => removeRow(rowIndex)} icon={mdiDelete}></Button></td>

					{#each cellsForRow(row) as [col, cell], colIndex}
						<td id="cell-{rowIndex}-{colIndex}" class="border p-2" style={`width: ${col.width}px;`}>
							<Tooltip
								title={col.schema.name +
									'=' +
									JSON.stringify(cell.value) +
									' ...' +
									JSON.stringify(col.schema.availableValues)}
							>
								{@const typ = col.schema.type}

								{#if typ === SchemaFieldTypeEnum.OneOf}
									<SelectField
										on:change={(e) => onChange(cell, rowIndex)}
										options={availableValues(col.schema)}
										bind:value={cell.value}
									/>
								{:else if typ === SchemaFieldTypeEnum.AnyOf}
									<MultiSelectField
										formatSelected={(e) => cell.value}
										rounded
										bind:label={cell.value}
										on:change={(e) => onMultiselectChange(e, cell, rowIndex)}
										options={availableValues(col.schema)}
										bind:value={cell.values}
									/>
								{:else if typ === SchemaFieldTypeEnum.Boolean}
									<Checkbox on:change={(e) => onChange(cell, rowIndex)} bind:checked={cell.value} />
								{:else if typ === SchemaFieldTypeEnum.Number}
									<!-- <NumberStepper on:change={(e) => onChange(cell, rowIndex)} class="w-full" bind:value={cell.value} /> -->
										<TextField
										debounceChange
										on:change={(e) => onChange(cell, rowIndex)}
										on:keydown={(e) => onFieldKeyDown(e, rowIndex, colIndex)}
										bind:value={cell.value}
										class="bg-gray-100 dark:bg-gray-800 rounded shadow-sm text-left text-lg"
									/>
								{:else if typ === SchemaFieldTypeEnum.Text}
									<TextField
										debounceChange
										on:change={(e) => onChange(cell, rowIndex)}
										on:keydown={(e) => onFieldKeyDown(e, rowIndex, colIndex)}
										multiline
										bind:value={cell.value}
										class="bg-gray-100 dark:bg-gray-800 rounded shadow-sm text-left text-lg"
									/>
								{:else if typ === SchemaFieldTypeEnum.Script}
									<div
										class="bg-gray-100 dark:bg-gray-800 rounded shadow-sm text-left text-lg">
										{execScript(row, col, cell)}
									</div>
									
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
