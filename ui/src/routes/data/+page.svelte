<script lang="ts">
	import type { Cell, Row, Settings, Spreadsheet } from '$lib/generated/index'
	import { SchemaFieldTypeEnum } from '$lib/generated/index'
	import { api, latestSettings } from '$lib/session'

	import { Card, Field, Button, Input, SelectField, MultiSelectField, type MenuOption } from 'svelte-ux'

	import { onMount } from 'svelte'

	let spreadsheet: Spreadsheet = {
		rows: []
	}

	function newRow(): Row {
		const cells = settings.fields.map((field) => {
			const cell: Cell = {
				type: field,
				value: ''
			}
			return cell
		})
		return { cells: cells }
	}
	function onAdd() {
		console.log('onAdd')
		spreadsheet.rows = [...spreadsheet.rows, newRow()]
	}
	async function onSave() {
		console.log('onSave')

		await api.saveSpreadsheet({ spreadsheet })
	}
	function asOption(value: string): MenuOption {
		return { label: value, value: value }
	}
	function onSetValues(cell: Cell, values) {
		cell.value = values ?? '' //.join(',')
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
	})
</script>

<main class="p-2">
	<h1>Data!</h1>
	{#each spreadsheet.rows as row, rowIndex}
		<div class="p-2">
			<Card heading={rowIndex + 1}>
				{#each row.cells as cell}
				  {#if cell.type.type === SchemaFieldTypeEnum.OneOf}
				  <Field label={cell.type.name} let:id>
					  <SelectField {id} options={(cell.type.availableValues ?? []).map((v) => asOption(v))} bind:value={cell.value} />
				  </Field>
				  {:else if cell.type.type === SchemaFieldTypeEnum.AnyOf}
				  <Field label={cell.type.name} let:id>
					<MultiSelectField {id} options={(cell.type.availableValues ?? []).map((v) => asOption(v))} on:change={(e) => onSetValues(cell, e.detail.value)} />
				</Field>
				  {:else}
					<Field label={cell.type.name} let:id>
						<Input {id} bind:value={cell.value} />
					</Field>
								{/if}
				{/each}
			</Card>
		</div>
	{/each}
	<Button class="p-2" color="primary" variant="outline" rounded on:click={onAdd}>Add</Button>
	<Button class="p-2" color="primary" variant="fill" rounded on:click={onSave}>Save</Button>
</main>
