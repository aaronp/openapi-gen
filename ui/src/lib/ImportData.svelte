<script lang="ts">
	import { parseCSV } from './util/parseCsv'
	import type { CSV } from './util/parseCsv'
	import { TextField, Button } from 'svelte-ux'
	import { api } from '$lib/session'
	import { SchemaFieldTypeEnum, type Cell, type SchemaField, type Columns, type Spreadsheet } from './generated'
	import { createEventDispatcher } from 'svelte'

	let fileName = ''
	let csv: CSV = {
		header: [],
		rows: []
	}
	let warningMessage = ''

	let fileContent = 'Drag and drop your CSV file here'

	const dispatch = createEventDispatcher()

	function handleDrop(event) {
		event.preventDefault()

		const file = event.dataTransfer.files[0]
		fileName = file.name

		if (file && file.type === 'text/csv') {
			const reader = new FileReader()
			reader.onload = (e) => {
				try {
					const result = e.target?.result ?? ''
					if (typeof result === 'string') {
						fileContent = result
						csv = parseCSV(fileContent)
					} else if (result instanceof ArrayBuffer) {
						const decoder = new TextDecoder('utf-8')
						fileContent = decoder.decode(result)
						csv = parseCSV(fileContent)
					} else {
						warningMessage = `Hmm... this may be a bug. The dropped result was ${typeof result}. Just ignore it an go on with your life.`
					}
				} catch (e) {
					warningMessage = `Error parsing file: ${e}`
				}
			}

			reader.readAsText(file)
		} else {
			warningMessage = `Sorry - only .csv files are supported, not ${file.type}`
		}
	}

	async function onDoImport(event) {
		// const response1 = await importSettings()
		const response2 = await importSheet()
		dispatch('onImportComplete', { csv })
	}
	async function importSheet() {
		const sheetRows = csv.rows.map((row) => {
			return {
				cells: row.cells.map((value, index) => {
					const cell: Cell = {
						type: asSchemaField(csv.header[index]),
						value: value, // this warning is one we have to live with
						values: []
					}
					return cell
				})
			}
		})
		const spreadsheet: Spreadsheet = { name: fileName, rows: sheetRows }
		return await api.saveSpreadsheet({ spreadsheet })
	}
	const asSchemaField = (name: string): SchemaField => {
		return {
			name,
			type: SchemaFieldTypeEnum.String,
			availableValues: []
		}
	}
	async function importSettings() {
		const settingsFields = csv.header.map((name) => {
			return asSchemaField(name)
		})
		const columns: Columns = {
			fields: settingsFields
		}

		// FIXME
		// return await api.updateSettings({ settings })
	}

	function handleDragOver(event) {
		event.preventDefault()
	}
</script>

<h2 class="text-lg">CSV Content to import</h2>
<h3 class="text-sm">(type or drag-and-drop a file)</h3>
<div class="drop-area" on:drop={handleDrop} on:dragover={handleDragOver}>
	<TextField classes={{ input: 'h-96', container: 'h-96' }} multiline label="CSV" bind:value={fileContent} />
</div>

{#if warningMessage}
	<div class="text-red-500">{warningMessage}</div>
{/if}

{#if csv.header.length > 0}
	<Button on:click={onDoImport} variant="fill" color="primary">Import</Button>
{/if}

<style>
	.drop-area {
		border: 2px dashed #ccc;
		padding: 20px;
		text-align: center;
		margin: 20px 0;
	}

	.drop-area:hover {
		background-color: #f0f0f0;
	}
</style>
