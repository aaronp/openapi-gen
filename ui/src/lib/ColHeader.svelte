<script lang="ts">
	import { SchemaFieldTypeEnum, type Column, type SchemaField } from '$lib/generated/index'
	import { mdiArrowLeft, mdiArrowRight, mdiCheck, mdiDelete, mdiTrashCan, mdiPencil } from '@mdi/js'
	import { createEventDispatcher } from 'svelte'
	import { Dialog, Button, Field, SelectField, TextField, type MenuOption, Toggle, MultiSelectField } from 'svelte-ux'
	import { asIdentifier } from './util/text'

	const dispatch = createEventDispatcher()

	export let hasLeft = true
	export let hasRight = true
	export let columns: Column[] = [
		{
			width : 100, schema: {
				name : 'Foo',
				type : SchemaFieldTypeEnum.String,
			}
		},
		{
			width : 100, schema: {
				name : 'Bar',
				type : SchemaFieldTypeEnum.String,
			}
		}
	]
	export let schema: SchemaField = {
		name: '',
		type: SchemaFieldTypeEnum.Script
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

	const inputOptions: MenuOption[] = columns.map((c) => asOption(asIdentifier(c.schema.name)))

	const options: MenuOption[] = [
		asOption(SchemaFieldTypeEnum.String),
		asOption(SchemaFieldTypeEnum.Text),
		asOption(SchemaFieldTypeEnum.Number),
		asOption(SchemaFieldTypeEnum.Boolean),
		asOption(SchemaFieldTypeEnum.Script),
		asOption(SchemaFieldTypeEnum.OneOf),
		asOption(SchemaFieldTypeEnum.AnyOf)
	]

	function onEnterCheck(event) {
		if (event.key === 'Enter') {
			// onUpdateSchema()
		}
	}

	function onDelete() {
		showMenu = false
		dispatch('delete')
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

	<div class={`absolute rounded left-0 top-full border bg-primary-100 dark:bg-primary-600 ${showMenu ? 'flex' : 'hidden'}`}>
		{#if hasLeft}
		<Button icon={mdiArrowLeft} on:click={(e) => onMove(true)}></Button>
		{/if}
		{#if hasRight}
		<Button icon={mdiArrowRight} on:click={(e) => onMove(false)}></Button>
		{/if}
		<Button icon={mdiPencil} on:click={(e) => (dialogueOpen = true)}></Button>

		<Toggle let:on={open} let:toggle let:toggleOff>
			<Button icon={mdiTrashCan} on:click={toggle} />
			<Dialog {open} on:close={toggleOff}>
				<div slot="title">Remove column {schema.name}?</div>
				<div class="px-6 py-3">This cannot be undone.</div>
				<div slot="actions">
					<Button icon={mdiDelete} on:click={() => onDelete()} variant="fill" color="danger">Remove Column</Button>
					<Button>Cancel</Button>
				</div>
			</Dialog>
		</Toggle>
	</div>
</div>

<Dialog bind:open={dialogueOpen} classes={{ dialog: 'w-96' }}>
	<div slot="title">Column Type</div>
	<div class="p-2">
		<Field label="Type">
			<SelectField {options} bind:value={schema.type} />
		</Field>

		{#if schema?.type === SchemaFieldTypeEnum.Script}
			<MultiSelectField
				options={inputOptions}
				formatSelected={(e) => schema.scriptInputs}
				label="RowCell"
				bind:value={schema.scriptInputs}
				/>

			<TextField
				label="Script"
				replace="script"
				classes={{ input: 'h-40', container: 'h-40' }}
				debounceChange
				multiline
				class="text-lg py-1 my-1"
				bind:value={values}
				on:keypress={onEnterCheck}
			/>
		{/if}
		{#if schema?.type === SchemaFieldTypeEnum.OneOf || schema?.type === SchemaFieldTypeEnum.AnyOf}
			<TextField
				label="Values"
				replace="values"
				debounceChange
				multiline
				class="text-lg py-1 my-1"
				bind:value={values}
				on:keypress={onEnterCheck}
			/>
		{/if}
	</div>
	<div slot="actions" >
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
