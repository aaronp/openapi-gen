<script lang="ts">
	import type { SchemaField, Settings } from '$lib/generated/index'
	import { api, latestSettings } from '$lib/session'

	import { debounce } from '$lib/util/debounce'
	import { SchemaFieldTypeEnum } from '$lib/generated/index'

	import { tick, onMount } from 'svelte'
	import { Card, Field, Button, Input, SelectField, type MenuOption } from 'svelte-ux'
	let settings: Settings = {
		urlPrefix: '/api/v1',
		fields: []
	}

	onMount(async () => {
		settings = await api.getSettings()
		latestSettings.set(settings)
	})

	function asOption(name: string): MenuOption {
		return { label: name, value: name }
	}

	let options: MenuOption[] = [
		asOption(SchemaFieldTypeEnum.String),
		asOption(SchemaFieldTypeEnum.Text),
		asOption(SchemaFieldTypeEnum.Integer),
		asOption(SchemaFieldTypeEnum.Double),
		asOption(SchemaFieldTypeEnum.Boolean),
		asOption(SchemaFieldTypeEnum.OneOf),
		asOption(SchemaFieldTypeEnum.AnyOf)
	]

	let selected = options[0].value

	async function save() {
		latestSettings.set(settings)
		await api.updateSettings({ settings })
		settings = settings
	}
	const debouncedSave = debounce(save, 4000)

	async function focusLastInput(id: string) {
		await tick() // Wait for DOM update
		const newElm = document.getElementById(id) as HTMLInputElement
		newElm?.focus()
		newElm?.setSelectionRange(0, 100)
	}

	function onEnterCheck(field: SchemaField, event) {
		if (event.key === 'Enter') {
			onAddField()
		}
		debouncedSave()
	}

	function onUpdateType(field: SchemaField, value: string) {
		console.log('onUpdateType')

		save()
	}
	function onUpdateValues(field: SchemaField, value: string) {
		console.log('onUpdateValues')
		const values = value
			.split(',')
			.map((item: string) => item.trim())
			.filter((item: string) => item.length > 0)

		field.availableValues = values

		save()
	}

	const onAddField = () => {
		settings.fields = [
			...settings.fields,
			{
				name: 'New Field',
				type: 'string'
			}
		]

		focusLastInput(`${settings.fields.length - 1}`)

		save()
	}
</script>

<main class="p-2">
	{#each settings.fields as field, index}
		<Card title={field.name} class="dark:bg-gray-800 bg-gray-200">
			<div class="grid grid-cols-[auto,auto] gap-2">
				<div class="items-center py-2 text-lg">
					<Field label="Name" let:id class="h-2 text-lg">
						<Input {id} replace="fieldname" bind:value={field.name} on:keypress={(e) => onEnterCheck(field, e)} />
					</Field>
				</div>

				<div class="">
					<Field label="Type" id={index}>
						<SelectField
							{index}
							{options}
							bind:value={field.type}
							on:change={(e) => onUpdateType(field, e.detail.value)}
						/>
					</Field>
				</div>
			</div>
			{#if field.type === SchemaFieldTypeEnum.OneOf || field.type === SchemaFieldTypeEnum.AnyOf}
				<Field label="Values" let:id class="py-2">
					<Input
						{id}
						replace="values"
						on:change={(e) => onUpdateValues(field, e.detail.value)}
						on:keypress={(e) => onEnterCheck(field, e)}
					/>
				</Field>
			{/if}
		</Card>
		<div class="p-2"></div>
	{/each}

	<Button class="p-2" color="primary" variant="fill" rounded on:click={onAddField}>Add Field</Button>
</main>
