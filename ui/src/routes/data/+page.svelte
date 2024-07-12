<script lang="ts">
	import type { Cell, Row, SaveSpreadsheetRequest, Settings, Spreadsheet } from '$lib/generated/index'
	import { SchemaFieldTypeEnum } from '$lib/generated/index'
	import { api, latestSettings, latestData } from '$lib/session'

	import { Overflow, Drawer, Dialog, Tabs, Tab, Icon, Button, Input, SelectField, MultiSelectField, type MenuOption, Checkbox, TextField, Tooltip } from 'svelte-ux'

	import { onMount } from 'svelte'
	import { mdiClose, mdiDelete, mdiPlus, mdiUpdate } from '@mdi/js'
	
	
	onMount(async () => {
		settings = await api.getSettings()
		latestSettings.set(settings)
		
		const all = await relistSpreadsheets()
		
		spreadsheetName = all[0]
		currentTab = spreadsheetName
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
	
	let settings: Settings = {
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

		latestData.set(spreadsheet)
	}
	function onMultiselectChange({detail} : CustomEvent, cell : Cell) {
		cell.values = detail.value
		cell.value = detail.value.join(',')

		onChange(cell)
	}

	function removeRow(index : number) {
		spreadsheet.rows = spreadsheet.rows.filter((_, i) => i !== index)
		onSave()
	}

	async function onAddNewSheet(name : string) {
		const request : SaveSpreadsheetRequest = {name, spreadsheet : { rows : []}}

		await api.saveSpreadsheet(request)

		await relistSpreadsheets()
	}
	function onChange(cell : Cell) {
		onSave()
	}
	
	function onTabChange(value : string) {
		currentTab = value
		
		reloadSpreadsheet(value)
		spreadsheetName = value
	}

	function onRemoveTab(value : string) {
		deletePage = value
		confirmDeleteOpen = true
	}
	async function onDoRemoveSheet(value : string) {
		const response = await api.deleteSpreadsheet({name : value})

		showSnackbar(response.message ?? "Remvoe returned " + response)
		//tabOptions = tabOptions.filter((o) => o.value !== value)
		await relistSpreadsheets()
	}

	function showSnackbar(message : string, duration : number = 1000) {
		snackbarMessage = message
		snackbarOpen = true
		window.setTimeout(() => {
			snackbarOpen = false
		}, duration)
	}

	function availableValues(cell : Cell) {
		const field = settings.fields.find((f) => f.name === cell.type.name) ?? cell.type
		// return (cell.type.availableValues ?? []).map((v) => asOption(v)) 
		return (field.availableValues ?? []).map((v) => asOption(v))
	}

	async function onRenameSheet({detail}){

		const oldName = spreadsheetName
		const newName = currentTab
		try {
			const result = await api.renameSpreadsheet({name : oldName, newName : newName})
			showSnackbar(result.message ?? `Renamed ${oldName} to ${newName}`)
		} catch (e) {
			showSnackbar("Rename errored with " + e, 15000)
		}

		await relistSpreadsheets()
	}
</script>

<main class="p-2">
	<div>
		<div class="flex">
			<div class="px-2 pt-1 text-lg mb-12">Sheet:</div>
			<div >
				<TextField bind:value={currentTab} />
			</div>
			<div  class="px-2 text-lg">
				<Button disabled={spreadsheetName.length < 1}  on:click={onRenameSheet} icon={mdiUpdate} >Rename</Button>
			</div>
		</div>
	</div>

	<Overflow>
		
	<div class="h-[80vh]" style="overflow: auto">
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
									<SelectField on:change={(e) => onChange(cell)} options={availableValues(cell)} bind:value={cell.value}  />									
								{:else if cell.type.type === SchemaFieldTypeEnum.AnyOf}
									<MultiSelectField formatSelected={(e) => cell.value} rounded bind:label={cell.value}  on:change={(e) => onMultiselectChange(e, cell)} options={availableValues(cell)} bind:value={cell.values} />
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
	</div>
</Overflow>
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
			  <Button on:click={(e) => onDoRemoveSheet(deletePage)} class="px-2" variant="fill" color="primary">Yes</Button>
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
