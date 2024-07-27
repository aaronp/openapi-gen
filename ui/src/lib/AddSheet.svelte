<script lang="ts">
	import { Button, TextField, Dialog } from 'svelte-ux'
	import { api } from '$lib/session'
	import { createEventDispatcher } from 'svelte'
	import { mdiCancel, mdiCreation } from '@mdi/js'
	import type { Spreadsheet } from './generated'

	const dispatch = createEventDispatcher()

	export let addDialogueOpen = true
	let newSheetName = 'NewSheet'

	$: scriptNameValid = newSheetName
	$: isOpen = addDialogueOpen ? true : onClose()

	async function onClose() {
		dispatch('onClose')
		false
	}
	async function onAddSheet() {
		const spreadsheet: Spreadsheet = { name: newSheetName, rows: [], columns: [] }

		await api.saveSpreadsheet({ spreadsheet })

		dispatch('onAdd', spreadsheet)
	}

	async function onAddSheetKeyDown(e) {
		if (e?.key === 'Enter' && scriptNameValid) {
			await onAddSheet()
			addDialogueOpen = false
		}
	}
</script>

<Dialog bind:open={addDialogueOpen}>
	<div slot="title">Create Sheet</div>
	<TextField on:keydown={(e) => onAddSheetKeyDown(e)} autofocus class="p-2" bind:value={newSheetName} label="Name" />
	<div slot="actions" class="p-2">
		<Button disabled={!scriptNameValid} on:click={onAddSheet} variant="fill" color="primary" icon={mdiCreation}
			>Create</Button
		>
		<Button variant="fill-outline" color="secondary" icon={mdiCancel}>Close</Button>
	</div>
</Dialog>
