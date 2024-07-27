<script lang="ts">
	import {
		Button,
		TextField,
		Dialog
	} from 'svelte-ux'
	import { api } from '$lib/session'
    import { createEventDispatcher } from 'svelte'
	import { mdiCancel, mdiCreation } from '@mdi/js'


	const dispatch = createEventDispatcher()

    export let renameDialogueOpen = true
	export let sheet = ''
	let newSheetName = sheet

    $:scriptNameValid = newSheetName && sheet != newSheetName

    $: isOpen = renameDialogueOpen ? true : onClose()

	async function onRenameSheet() {
        const oldName = sheet
        const request = {old : oldName, _new : newSheetName}

        await api.renameSpreadsheet(request)
        dispatch('onRename', request)
    }

	async function onClose() {
        dispatch('onClose')
        false
    }

	async function onRenameSheetKeyDown(e) {
		if (e?.key === 'Enter' && scriptNameValid) {
			await onRenameSheet()
			renameDialogueOpen = false
		}
	}
</script>

renameDialogueOpen: {renameDialogueOpen}
<Dialog bind:open={renameDialogueOpen}>
    <div slot="title">Rename '{sheet}'</div>
    <TextField
        on:keydown={(e) => onRenameSheetKeyDown(e)}
        autofocus
        class="p-2"
        bind:value={newSheetName}
        label="Sheet"
    />
    <div slot="actions" class="p-2">
        <Button disabled={!scriptNameValid} on:click={onRenameSheet} variant="fill" color="primary" icon={mdiCreation}
            >Ok</Button
        >
        <Button variant="fill-outline" color="secondary" icon={mdiCancel} >Close</Button>
    </div>
</Dialog>
