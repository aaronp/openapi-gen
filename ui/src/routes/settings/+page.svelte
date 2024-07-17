<script lang="ts">
	import type { SchemaField, Settings } from '$lib/generated/index'
	import { api, latestSettings } from '$lib/session'

	import { debounce } from '$lib/util/debounce'
	import { SchemaFieldTypeEnum } from '$lib/generated/index'

	import { mdiDelete } from '@mdi/js'

	import { tick, onMount } from 'svelte'
	import { Field, TextField, Button, Input, SelectField, type MenuOption } from 'svelte-ux'
	let settings: Settings = {
		fields: []
	}

	let valuesByFieldName = new Map<string, string>()

	onMount(async () => {
		settings = await api.getSettings()

		resetFieldValueMap()
		latestSettings.set(settings)
	})

	function resetFieldValueMap() {
		valuesByFieldName.clear()
		settings.fields.forEach((field) => {
			valuesByFieldName.set(field.name, field?.availableValues?.join(', ') ?? '')
		})
	}
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

	async function onFieldNameChange(field: SchemaField, event) {
		valuesByFieldName.set(event.detail.value, field?.availableValues?.join(', ') ?? '')
		valuesByFieldName = valuesByFieldName
		save()
	}
	function onEnterCheck(field: SchemaField, event) {
		if (event.key === 'Enter') {
			onAddField()
		}
		resetFieldValueMap()
		debouncedSave()
	}

	function onUpdateType(field: SchemaField, value: string) {
		save()
	}
	function onUpdateValues(field: SchemaField, value: string) {
		const values = value
			.split(',')
			.map((item: string) => item.trim())
			.filter((item: string) => item.length > 0)

		field.availableValues = values
		valuesByFieldName.set(field.name, value)

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

	function onDelete(field: SchemaField, index: number) {
		settings.fields.splice(index, 1)
		settings = settings
		save()
	}
	function onMoveUp(field: SchemaField, index: number) {
		const above = settings.fields[index - 1]
		settings.fields[index - 1] = field
		settings.fields[index] = above
		save()
	}
	function onMoveDown(field: SchemaField, index: number) {
		const below = settings.fields[index + 1]
		settings.fields[index] = below
		settings.fields[index + 1] = field
		save()
	}
</script>

<div class="m-2">
	<header class="bg-secondary-100 text-black dark:text-white p-4 my-4">
		<h1 class="text-2xl font-bold">Sheet Settings</h1>
	</header>

	{#each settings.fields as field, index}
		<div class="flex items-center">
			<!-- Up and Down Icons -->
			<div class="flex flex-col items-center h-16 justify-center space-y-1">
				<svg
					on:click|preventDefault={(e) => onMoveUp(field, index)}
					class="w-12 h-20 hover-pointer"
					fill="currentColor"
					viewBox="0 0 24 24"
					aria-label="Move Up"
				>
					{#if index > 0}
						<path d="M7 14l5-5 5 5H7z"></path>
					{/if}
				</svg>
				<svg
					on:click|preventDefault={(e) => onMoveDown(field, index)}
					class="w-12 h-20 hover-pointer"
					fill="currentColor"
					viewBox="0 0 24 24"
					aria-label="Move Down"
				>
					{#if index < settings.fields.length - 1}
						<path d="M7 10l5 5 5-5H7z"></path>
					{/if}
				</svg>
			</div>

			<div class="flex gap-2">
				<div class="items-center text-lg">
					<Field label="Name" let:id class="pl-2">
						<TextField
							class="h-9 text-lg w-96"
							{id}
							replace="fieldname"
							autofocus
							debounceChange
							on:change={async (e) => onFieldNameChange(field, e)}
							bind:value={field.name}
							on:keypress={(e) => onEnterCheck(field, e)}
						/>
					</Field>
				</div>

				<div class="w-40">
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
			<!-- Delete Button -->
			<Button
				variant="fill-light"
				on:click={onDelete(field, index)}
				class="flex items-center justify-center mx-2 text-primary-600 hover:bg-primary-200 rounded"
			>
				<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
					<path d={mdiDelete}></path>
				</svg>
			</Button>
		</div>
		{#if field.type === SchemaFieldTypeEnum.OneOf || field.type === SchemaFieldTypeEnum.AnyOf}
			<div>
				<TextField
					label="Values"
					replace="values"
					debounceChange
					class="pl-14 py-2 mb-8 h-9 text-lg w-1/2"
					value={valuesByFieldName.get(field.name)}
					on:change={(e) => onUpdateValues(field, e.detail.value)}
					on:keypress={(e) => onEnterCheck(field, e)}
				/>
			</div>
		{/if}
	{/each}

	<Button class="ml-14 mt-4" color="primary" variant="fill" rounded on:click={onAddField}>Add Field</Button>
</div>

<style>
	.hover-pointer:hover {
		cursor: pointer;
	}
</style>
