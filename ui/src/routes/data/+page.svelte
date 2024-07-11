<script lang="ts">
	import type { Cell, Row, Settings, Spreadsheet } from '$lib/generated/index'
	import { SchemaFieldTypeEnum } from '$lib/generated/index'
	import { api, latestSettings, latestData } from '$lib/session'

	import { Card, Field, Button, Input, SelectField, MultiSelectField, type MenuOption, NumberStepper, Checkbox, TextField, Tooltip } from 'svelte-ux'

	import { onMount } from 'svelte'
	import { mdiDelete } from '@mdi/js'

	let spreadsheet: Spreadsheet = {
		rows: []
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
		console.log('onSave')

		latestData.set(spreadsheet)
		await api.saveSpreadsheet({ spreadsheet })
	}
	function asOption(value: string): MenuOption {
		return { label: value, value: value }
	}
	let settings: Settings = {
		filename: '',
		urlPrefix: '',
		fields: []
	}
	onMount(async () => {
		settings = await api.getSettings()
		latestSettings.set(settings)
		spreadsheet = await api.getSpreadsheet()
		spreadsheet.rows.forEach((row) => {
			row.cells.forEach((cell) => {
				if (cell.type.type === SchemaFieldTypeEnum.AnyOf) {
					if (!cell.value) {
					cell.value = (cell?.values ?? []).join(',')
					}
				}
			})
		})
	})

	function onMultiselectChange({detail} : CustomEvent, cell : Cell) {
		console.log('onMultiselectChange', detail.value, ', type ', typeof detail, ', detail ', detail)
		cell.values = detail.value
		cell.value = detail.value.join(',')
	}

	function removeRow(index : number) {
		spreadsheet.rows = spreadsheet.rows.filter((_, i) => i !== index)
	}
</script>

<main class="p-2">
	<table>
		<thead>
			<tr>
				<th>Action</th>
				{#each settings.fields as field}
					<th>{field.name}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each spreadsheet.rows as row, rowIndex}
				<tr>
					<td><Button on:click={(e) => removeRow(rowIndex)} icon={mdiDelete}></Button></td>
					{#each row.cells as cell}
						<td class="px-6 py-4 border-b border-gray-300 text-center">

							<Tooltip title={cell.type.name}>
							{#if cell.type.type === SchemaFieldTypeEnum.OneOf}
								<SelectField options={(cell.type.availableValues ?? []).map((v) => asOption(v))} bind:value={cell.value}  />									
							{:else if cell.type.type === SchemaFieldTypeEnum.AnyOf}
								<MultiSelectField formatSelected={(e) => cell.value} rounded bind:label={cell.value}  on:change={(e) => onMultiselectChange(e, cell)} options={(cell.type.availableValues ?? []).map((v) => asOption(v))} bind:value={cell.values} />
							{:else if cell.type.type === SchemaFieldTypeEnum.Text}
								<TextField debounceChange multiline bind:value={cell.value} class=" rounded shadow-lg px-2 py-4 text-left text-lg" />
							{:else if cell.type.type === SchemaFieldTypeEnum.Boolean}
									<Checkbox bind:value={cell.value} />
							{:else}
							<span >
								<Input debounceChange bind:value={cell.value} class="bg-gray-300 dark:bg-gray-500 shadow-lg px-2 py-2 text-left text-lg" />
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
</main>
