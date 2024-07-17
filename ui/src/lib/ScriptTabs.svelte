<script lang="ts">
	import { onMount, tick } from 'svelte'
	import { api } from '$lib/session'

	import { EverySheet } from '$lib/util/cache'
	import { Drawer, Dialog, Tabs, Tab, Icon, Button, type MenuOption, Toggle, TextField } from 'svelte-ux'
	import { mdiCancel, mdiClose, mdiCreation, mdiPlus, mdiUpdate } from '@mdi/js'
	import ScriptEditor from './ScriptEditor.svelte'

	function asOption(value: string): MenuOption {
		return { label: value, value: value }
	}

	let scriptNames: string[] = []

	// tab stuff
	let newTabDialogOpen = false
	let newScriptName = 'NewScript.json'
	$: newScriptNameTrimmed = newScriptName?.trim() ?? ''
	$: scriptNameValid = newScriptNameTrimmed.length > 0 && !newScriptNameTrimmed.includes(' ')

	// tab stuff
	let currentTab = ''
	// needed to confirm deletion
	let deleteTab = ''
	let confirmDeleteOpen = false

	$: tabOptions = scriptNames.map((s) => asOption(s))

	// used for showing snackbars
	let snackbarOpen = false
	let snackbarMessage = ''

	onMount(async () => {
		const all = await relistScripts()
		currentTab = all[0]
	})

	function onRemoveTab(value: string) {
		deleteTab = value
		confirmDeleteOpen = true
	}

	async function relistScripts(): Promise<string[]> {
		const all = await api.listScripts()
		scriptNames = all
		// scriptNames = all.length < 1 ? ['Script-1'] : all
		return scriptNames
	}

	async function onNewScriptInput(e) {
		if (e?.key === 'Enter' && scriptNameValid) {
			await onAddNewScript()
			newTabDialogOpen = false
		}
	}
	async function onAddNewScript() {
		const script = {
			name: newScriptNameTrimmed,
			input: EverySheet, // <-- can be the sheet names, another script, or 'sheets' for all the sheet data
			script: 'console.log(input)',
			autoSave: false
		}
		await api.saveScript({ script })

		newScriptName = 'NewScript.json' // reset
		currentTab = newScriptNameTrimmed
		await relistScripts()
	}

	async function onDoRemoveScript(tab: string) {
		await api.deleteScript({ name: tab })
		showSnackbar('Deleted ' + tab)

		await relistScripts()
	}

	function showSnackbar(message: string, duration: number = 1000) {
		snackbarMessage = message
		snackbarOpen = true
		window.setTimeout(() => {
			snackbarOpen = false
		}, duration)
	}

	async function onScriptRename(event) {
		showSnackbar('onScriptRename ' + event)
		await relistScripts()
	}
</script>

<Tabs class="bg-muted mt-2 rounded" placement="top" bind:options={tabOptions} bind:value={currentTab}>
	{#each tabOptions as option (option.value)}
		<Tab selected={currentTab === option.value} on:click={() => (currentTab = option.value)}>
			{option.label}

			<Icon
				data={mdiClose}
				class="rounded-full p-0.5 hover:bg-surface-content/5"
				on:click={(e) => {
					e.stopPropagation()
					onRemoveTab(option.value)
				}}
			/>
		</Tab>
	{/each}

	<Toggle let:on={open} let:toggleOn let:toggleOff>
		<Tab
			on:click={(e) => {
				newTabDialogOpen = true
				toggleOn
			}}
		>
			<Icon data={mdiPlus} class="rounded-full p-0.5 hover:bg-surface-content/5" />
		</Tab>
	</Toggle>

	<svelte:fragment slot="content">
		<div class="flex flex-col">
			{#key currentTab}
				<ScriptEditor on:renameEvent={onScriptRename} bind:scriptName={currentTab} />
			{/key}
		</div>

		<Dialog bind:open={confirmDeleteOpen}>
			<div slot="title">Do you want to delete "{deleteTab}"</div>
			<div slot="actions">
				<Button on:click={(e) => onDoRemoveScript(deleteTab)} class="px-2" variant="fill" color="primary">Yes</Button>
				<Button class="px-2" variant="outline" color="secondary">Close</Button>
			</div>
		</Dialog>
	</svelte:fragment>
</Tabs>

<Dialog bind:open={newTabDialogOpen}>
	<div slot="title">New Script</div>
	<TextField
		on:keydown={(e) => onNewScriptInput(e)}
		autofocus
		class="p-2"
		hint={scriptNameValid ? '' : 'Name cannot contain spaces'}
		error={!scriptNameValid}
		bind:value={newScriptName}
		label="Script Name"
	/>
	<div slot="actions" class="p-2">
		<Button disabled={!scriptNameValid} on:click={onAddNewScript} variant="fill" color="primary" icon={mdiCreation}
			>Ok</Button
		>
		<Button variant="fill-outline" color="secondary" icon={mdiCancel}>Close</Button>
	</div>
</Dialog>

<Drawer bind:open={snackbarOpen} placement="bottom" class="h-32">
	<h1 class="text-center py-8">{snackbarMessage}</h1>
	<div slot="actions">
		<Button on:click={() => (snackbarOpen = false)}>Close</Button>
	</div>
</Drawer>
