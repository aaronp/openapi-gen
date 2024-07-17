<script lang="ts">
	import type { SchemaField, Settings } from '$lib/generated/index'
	import { api, latestSettings } from '$lib/session'

	import { debounce } from '$lib/util/debounce'
	import { SchemaFieldTypeEnum } from '$lib/generated/index'

	import { tick, onMount } from 'svelte'
	import { Field, TextField, Button, Input, SelectField, type MenuOption } from 'svelte-ux'
	let settings: Settings = {
		fields: []
	}

	let valuesByFieldName = new Map<string, string>()

	onMount(async () => {
		settings = await api.getSettings()
		settings.fields.forEach((field) => {
			valuesByFieldName.set(field.name, field?.availableValues?.join(', ') ?? '')
		})
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
</script>

<div class="m-2">
	<header class="bg-secondary-100 text-black dark:text-white p-4 my-4">
		<h1 class="text-2xl font-bold">Sheet Settings</h1>
	</header>

	{#each settings.fields as field, index}
		<div class="dark:bg-gray-700 bg-gray-200 p-2">
			<div class="flex gap-2">
				<div class="items-center text-lg">
					<Field label="Name" let:id class="pl-2 w-80">
						<TextField
							class="h-9 text-lg"
							{id}
							replace="fieldname"
							autofocus
							debounceChange
							on:change={async (e) => save()}
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
			{#if field.type === SchemaFieldTypeEnum.OneOf || field.type === SchemaFieldTypeEnum.AnyOf}
				<TextField
					label="Values"
					replace="values"
					debounceChange
					class="px-2 py-2 mb-8 h-9 text-lg w-5/6"
					value={valuesByFieldName.get(field.name)}
					on:change={(e) => onUpdateValues(field, e.detail.value)}
					on:keypress={(e) => onEnterCheck(field, e)}
				/>
			{/if}
		</div>
		<div class="p-2"></div>
	{/each}

	<Button class="p-2" color="primary" variant="fill" rounded on:click={onAddField}>Add Field</Button>
</div>
