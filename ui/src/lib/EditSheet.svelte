<script lang="ts">
	import { Button, TextField, Dialog } from 'svelte-ux'
	import { api } from '$lib/session'
	import { createEventDispatcher } from 'svelte'
	import { mdiCancel, mdiContentDuplicate, mdiCreation, mdiDelete, mdiPencil } from '@mdi/js'

	const dispatch = createEventDispatcher()

	export let renameDialogueOpen = true
	export let sheet = ''
	export let action : 'rename' | 'delete' | 'copy'

	function capitalize(text: string): string {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
}

    $: title = (action == 'rename') ? 'Rename' : ((action == 'delete') ? 'Delete' : 'Copy')
	let newSheetName = sheet

	$: icon = (action === 'delete') ? mdiDelete : ((action === 'rename') ? mdiPencil : mdiContentDuplicate)
	$: buttonLabel = capitalize(action)
	$: scriptNameValid = newSheetName && (action != 'rename' || sheet != newSheetName)

	// not used here, but needed to dispatch close events
	$: isOpen = renameDialogueOpen ? true : onClose()

	async function onDoStuff() {
		const oldName = sheet
		const request = { old: oldName, _new: newSheetName }

		if (action === 'rename') {
			await api.renameSpreadsheet(request)
		} else if (action === 'delete') {
			await api.deleteSpreadsheet({ name : sheet })
		} else if (action === 'copy') {
			await api.copySpreadsheet(request)
		}
		dispatch('onEdit', request)
	}

	async function onClose() {
		dispatch('onClose')
		false
	}

	async function onDoStuffKeyDown(e) {
		if (e?.key === 'Enter' && scriptNameValid) {
			await onDoStuff()
			renameDialogueOpen = false
		}
	}
</script>

<Dialog bind:open={renameDialogueOpen}>
	<div slot="title">{title} '{sheet}'</div>
	{#if action != 'delete'}
		<TextField
			on:keydown={(e) => onDoStuffKeyDown(e)}
			autofocus
			class="p-2"
			bind:value={newSheetName}
			label="Sheet"
		/>
	{/if}
	<div slot="actions" class="p-2">
		<Button disabled={!scriptNameValid} on:click={onDoStuff} variant="fill" color="primary" icon={icon}
			>{buttonLabel}</Button
		>
		<Button variant="fill-outline" color="secondary" icon={mdiCancel}>Close</Button>
	</div>
</Dialog>
