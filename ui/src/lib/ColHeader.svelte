<script lang="ts">
	import { SchemaFieldTypeEnum, type SchemaField } from '$lib/generated/index'
	import { mdiArrowLeft, mdiArrowRight, mdiCheck, mdiPencil } from '@mdi/js'
	import { createEventDispatcher } from 'svelte'
	import { Dialog, Button, Field, SelectField, TextField, type MenuOption } from 'svelte-ux'

	const dispatch = createEventDispatcher()

	export let schema: SchemaField = {
		name: '',
		type: SchemaFieldTypeEnum.AnyOf
	}

	let values = schema?.availableValues?.join(', ') ?? ''

	export let dialogueOpen = false
	$: isOpen = dialogueOpen ? true : onCancel()

	function onCancel() {
		showMenu = false
	}

	function onUpdateSchema() {
		schema.availableValues = values
			.split(',')
			.map((item: string) => item.trim())
			.filter((item: string) => item.length > 0)

		showMenu = false
		dispatch('schemaUpdated', schema)
	}

	let showMenu = false

	const handleMouseEnter = () => {
		showMenu = true
	}

	const handleMouseLeave = () => {
		showMenu = false
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

	function onEnterCheck(event) {
		if (event.key === 'Enter') {
			onUpdateSchema()
		}
	}

	function onMove(isLeft: boolean) {
		showMenu = false
		if (isLeft) {
			dispatch('moveLeft')
		} else {
			dispatch('moveRight')
		}
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="relative"
	on:mouseenter={handleMouseEnter}
	on:mouseleave={handleMouseLeave}
	aria-roledescription="edit column"
>
	<TextField
		debounceChange
		bind:value={schema.name}
		on:change={(e) => dispatch('schemaUpdated', schema)}
		classes={{ container: 'bg-gray-200 dark:bg-gray-800 border-0 border-none' }}
		class="ml-2 text-left text-lg "
	/>

	<div class={`absolute left-0 top-full border bg-secondary-800 ${showMenu ? 'flex' : 'hidden'}`}>
		<Button icon={mdiArrowLeft} on:click={(e) => onMove(true)}></Button>
		<Button icon={mdiArrowRight} on:click={(e) => onMove(false)}></Button>
		<Button icon={mdiPencil} on:click={(e) => (dialogueOpen = true)}></Button>
	</div>
</div>

<Dialog bind:open={dialogueOpen} classes={{ dialog: 'w-96' }}>
	<div slot="title">Column Type</div>
	<div class="p-2">
		<Field label="Type">
			<SelectField {options} bind:value={schema.type} />
		</Field>

		{#if schema?.type === SchemaFieldTypeEnum.OneOf || schema?.type === SchemaFieldTypeEnum.AnyOf}
			<TextField
				label="Values"
				replace="values"
				debounceChange
				multiline
				class="text-lg py-2 my-8"
				bind:value={values}
				on:keypress={onEnterCheck}
			/>
		{/if}
	</div>
	<div slot="actions" class="m-10">
		<Button variant="fill" color="secondary" icon={mdiCheck} on:click={onUpdateSchema}>Ok</Button>
	</div>
</Dialog>

<style>
	.menu {
		display: none;
	}

	.menu.show {
		display: flex;
	}
</style>
