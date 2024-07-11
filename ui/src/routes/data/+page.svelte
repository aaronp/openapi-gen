<script lang="ts">
	import type { Cell, Row, SaveSpreadsheetRequest, Settings, Spreadsheet } from '$lib/generated/index'
	import { SchemaFieldTypeEnum } from '$lib/generated/index'
	import { api, latestSettings, latestData } from '$lib/session'

	import { Drawer, Dialog, Tabs, Tab, Icon, Button, Input, SelectField, MultiSelectField, type MenuOption, Checkbox, TextField, Tooltip } from 'svelte-ux'

	import { onMount } from 'svelte'
	import { mdiClose, mdiDelete, mdiPlus } from '@mdi/js'
	
	
	onMount(async () => {
		settings = await api.getSettings()
		latestSettings.set(settings)
		
		const all = await relistSpreadsheets()
		
		spreadsheetName = all[0]
		reloadSpreadsheet(spreadsheetName)
	})

	// used for confirming / deleting pages
	let deletePage = ''
	let confirmDeleteOpen = false


	// used for showing snackbars
	let snackbarOpen = false
	let snackbarMessage = ''

	let spreadsheets : string[] = []
	let spreadsheetName : string = ''
	let currentTab = ''
	$: tabOptions = spreadsheets.map((s) => asOption(s))
	let spreadsheet: Spreadsheet = {
		rows: []
	}
	
	let msg = ''

	let settings: Settings = {
		filename: '',
		urlPrefix: '',
		fields: []
	}
	function newRow(): Row {
		const cells = settings.fields.map((field) => {
			const cell: Cell = {
				type: field,
				value: '', 
				values: []
			}
			return cell
		})
		return { cells: cells }
	}
	function onAdd() {
		console.log('onAdd')
		spreadsheet.rows = [...spreadsheet.rows, newRow()]

		onSave()
	}
	async function onSave() {
		console.log('onSave ', spreadsheetName)

		if (spreadsheetName) {
			latestData.set(spreadsheet)
			await api.saveSpreadsheet({ name : spreadsheetName ,  spreadsheet })
		}
	}

	function asOption(value: string): MenuOption {
		return { label: value, value: value }
	}
	async function relistSpreadsheets(): Promise<string[]> {
		const all = await api.listSpreadsheets()
		msg = 'relistSpreadsheets:' + all.length + ' : ' + all.join(', ') 
		spreadsheets = all.length < 1 ? ["New"] : all
		return spreadsheets
	}
	async function reloadSpreadsheet(n : string = spreadsheetName) {
		spreadsheet = await api.getSpreadsheet({name : n})
		spreadsheet.rows.forEach((row) => {
			row.cells.forEach((cell) => {
				if (cell.type.type === SchemaFieldTypeEnum.AnyOf) {
					if (!cell.value) {
						cell.value = (cell?.values ?? []).join(',')
					}
				}
			})
		})
	}
	function onMultiselectChange({detail} : CustomEvent, cell : Cell) {
		console.log('onMultiselectChange', detail.value, ', type ', typeof detail, ', detail ', detail)
		cell.values = detail.value
		cell.value = detail.value.join(',')

		onChange(cell)
	}

	function removeRow(index : number) {
		spreadsheet.rows = spreadsheet.rows.filter((_, i) => i !== index)
	}

	async function onAddNewSheet(name : string) {
		const request : SaveSpreadsheetRequest = {name, spreadsheet : { rows : []}}

		await api.saveSpreadsheet(request)

		await relistSpreadsheets()
	}
	function onChange(cell : Cell) {
		msg = 'onChange:' + cell.value + ' for ' + spreadsheetName
		onSave()
	}
	
	function onTabChange(value : string) {
		currentTab = value
		
		reloadSpreadsheet(value)
		spreadsheetName = value
	}

	function onRemoveTab(value : string) {
		msg = 'onRemoveTab:' + value
		
		deletePage = value
		confirmDeleteOpen = true
	}
	async function onDoRemoveSheet(value : string) {
		const response = await api.deleteSpreadsheet({name : value})

		showSnackbar(response.message ?? "Remvoe returned " + response)
		//tabOptions = tabOptions.filter((o) => o.value !== value)
		await relistSpreadsheets()
	}

	function showSnackbar(message : string) {
		snackbarMessage = message
		snackbarOpen = true
		window.setTimeout(() => {
			snackbarOpen = false
		}, 2000)
	}

	async function onUpdateSheetName({detail}){
		msg = `onUpdateSheetName: spreadsheetName=${spreadsheetName}, current=${currentTab} to ${detail.value}`
		const result = await api.renameSpreadsheet({name : spreadsheetName, newName : detail.value})

		showSnackbar(result.message ?? "Rename returned " + result)
		
		await relistSpreadsheets()
		// const index = spreadsheets.findIndex((s) => s === detail.value)
		// if (index >= 0) {
		// 	spreadsheets[index] = detail.value
		// }
		// spreadsheetName = detail.value
		// currentTab = detail.value
	}
</script>

<main class="p-2">
	<div>msg:{msg}</div>
	<div>spreadsheetName = {spreadsheetName}</div>
	<div>currentTab = {currentTab}</div>
	<TextField debounceChange bind:value={currentTab} on:change={onUpdateSheetName} />

	<table>
		<thead>
			{#if spreadsheet.rows.length > 0}
			<tr>
				<th>Action</th>
				{#each settings.fields as field}
					<th>{field.name}</th>
				{/each}
			</tr>
			{/if}
		</thead>
		<tbody>
			{#each spreadsheet.rows as row, rowIndex}
				<tr>
					<td><Button on:click={(e) => removeRow(rowIndex)} icon={mdiDelete}></Button></td>
					{#each row.cells as cell}
						<td class="px-6 py-2 border-b border-gray-300 text-center">

							<Tooltip title={cell.type.name}>
							{#if cell.type.type === SchemaFieldTypeEnum.OneOf}
								<SelectField on:change={(e) => onChange(cell)} options={(cell.type.availableValues ?? []).map((v) => asOption(v))} bind:value={cell.value}  />									
							{:else if cell.type.type === SchemaFieldTypeEnum.AnyOf}
								<MultiSelectField formatSelected={(e) => cell.value} rounded bind:label={cell.value}  on:change={(e) => onMultiselectChange(e, cell)} options={(cell.type.availableValues ?? []).map((v) => asOption(v))} bind:value={cell.values} />
							{:else if cell.type.type === SchemaFieldTypeEnum.Text}
								<TextField on:change={(e) => onChange(cell)} debounceChange multiline bind:value={cell.value} class=" rounded shadow-lg px-2 py-4 text-left text-lg" />
							{:else if cell.type.type === SchemaFieldTypeEnum.Boolean}
									<Checkbox on:change={(e) => onChange(cell)} bind:checked={cell.value} />
							{:else}
							<span >
								<Input debounceChange on:change={(e) => onChange(cell)}  bind:value={cell.value} class="bg-gray-300 dark:bg-gray-500 shadow-lg px-2 py-2 text-left text-lg" />
							</span>
							{/if}
						</Tooltip>
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
	<Button class="p-2" color="primary" variant="outline" rounded on:click={onAdd}>Add</Button>
	<Button class="p-2" color="primary" variant="fill" rounded on:click={onSave}>Save</Button>


	<Tabs  placement="bottom" bind:options={tabOptions} on:change={(e) => (currentTab = e.detail.value)}>

		{#each tabOptions as option (option.value)}
		<Tab
		  on:click={() => (onTabChange(option.value))}
		  selected={currentTab === option.value}
		>
		  {option.label}
	
		  <Icon
			data={mdiClose}
			class="rounded-full p-0.5 hover:bg-surface-content/5"
			on:click={(e) => {
			  e.stopPropagation()
			  onRemoveTab(option.value)
			}}
		  />
		</Tab>
	  {/each}
	
	  <Tab
		on:click={(e) => onAddNewSheet(`New-${spreadsheets.length}`)}
	  >
		<Icon
		  data={mdiPlus}
		  class="rounded-full p-0.5 hover:bg-surface-content/5"
		/>
	  </Tab>
	
	  <svelte:fragment slot="content">
		<Dialog bind:open={confirmDeleteOpen}>
			<div slot="title">Do you want to delete "{deletePage}"</div>
			<div slot="actions">
			  <Button on:click={onDoRemoveSheet(deletePage)} class="px-2" variant="fill" color="primary">Yes</Button>
			  <Button class="px-2" variant="outline" color="secondary">Close</Button>
			</div>
		  </Dialog>
	  </svelte:fragment>
	  
	</Tabs>

	<Drawer bind:open={snackbarOpen} placement="bottom" class="h-32">
		<h1 class="text-center py-8">{snackbarMessage}</h1>
		<div slot="actions">
		  <Button on:click={() => (snackbarOpen = false)}>Close</Button>
		</div>
	  </Drawer>
</main>
