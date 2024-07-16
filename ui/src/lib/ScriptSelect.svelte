<script lang="ts">
	import { onMount, tick } from 'svelte'
	import { scriptSelect, api } from '$lib/session'
	import type { Script } from './generated'

	import { inputSources, EverySheet } from '$lib/util/cache'
	import { SelectField, Drawer, Dialog, Tabs, Tab, Icon, Button, type MenuOption, Checkbox, TextField } from 'svelte-ux'
	import { mdiClose, mdiPlus, mdiUpdate } from '@mdi/js'

	function asOption(value: string): MenuOption {
		return { label: value, value: value }
	}

	let scriptNames: string[] = []

	// tab stuff
	let currentTab = ''
	// needed to confirm deletion
	let deleteTab = ''
	let confirmDeleteOpen = false

	$: tabOptions = scriptNames.map((s) => asOption(s))

	// used for showing snackbars
	let snackbarOpen = false
	let snackbarMessage = ''

	const newScript = (): Script => {
		return {
			name: 'jason',
			input: EverySheet, // <-- can be the sheet names, another script, or 'sheets' for all the sheet data
			script: 'console.log(input)',
			autoSave: false
		}
	}
	// this is the last one we've read from the server
	let loadedScript: Script = newScript()

	// this is the one we're editing
	let script: Script = loadedScript

	let sources: MenuOption[] = []
	onMount(async () => {
		const all = await relistScripts()

		script.name = all[0]
		await reloadScript(script.name)
	})

	function onRemoveTab(value: string) {
		deleteTab = value
		confirmDeleteOpen = true
	}

	async function reloadScript(name: string) {
		if (!name) {
			console.error('reload script called with no name')
		} else {
			// reload our sourcee, which need to filter out the current script
			// (a script can't depend on itself)
			sources = await inputSources(name)

			loadedScript = await api.getScript({ name })
			script = loadedScript

			currentTab = script.name

			// publish the latest script
			scriptSelect.set(script)
		}
	}

	async function relistScripts(): Promise<string[]> {
		const all = await api.listScripts()
		scriptNames = all.length < 1 ? ['New'] : all
		return scriptNames
	}

	async function onTabChange(value: string) {
		// currentTab = value

		if (value) {
			await reloadScript(value)
		} else {
			showSnackbar('WTF? tabChange value is false ' + value, 8000)
		}
	}

	async function onAddNewScript(name: string) {
		const s = newScript()
		s.name = name
		await api.saveScript({ script: s })

		await relistScripts()
	}

	async function onRenameScript() {
		console.log(`Renaming script oldName=${currentTab} to newName=${script.name}`)

		try {
			const result = await api.renameScript({ old: currentTab, _new: script.name })
		} catch (e) {
			showSnackbar('Rename errored with ' + e, 15000)
		}

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

	async function onSave() {
		if (script.input === script.name) {
			showSnackbar(`script ${script.name} depends on itself!`, 8000)
		} else if (!script.name) {
			showSnackbar(`Script name cannot be empty`, 8000)
		} else if (!script.input) {
			// BUG - we should reload the script
			script = await api.getScript({ name: script.name })
			showSnackbar(`ScriptSelect Bug: Script input cannot be empty, reloading... `)
		} else {
			const response = await api.saveScript({ script })
			showSnackbar(response.message ?? `Saved ${script.name}`)
			await reloadScript(script.name)
		}
	}

	$: selectError = !script.input ? 'Input source is required' : ''
</script>

<Tabs
	class="bg-muted mt-2 rounded"
	placement="top"
	bind:options={tabOptions}
	on:change={(e) => (currentTab = e.detail.value)}
>
	{#each tabOptions as option (option.value)}
		<Tab on:click={() => onTabChange(option.value)} selected={currentTab === option.value}>
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

	<Tab on:click={(e) => onAddNewScript(`New-${scriptNames.length + 1}`)}>
		<Icon data={mdiPlus} class="rounded-full p-0.5 hover:bg-surface-content/5" />
	</Tab>

	<svelte:fragment slot="content">
		<div class="p-2">
			<!--  Script Name -->
			<div>
				<div class="flex pt-2">
					<div class="pt-1 pr-2 text-lg">Name:</div>
					<div>
						<TextField bind:value={script.name} />
					</div>
					<div class="px-2 text-lg">
						<Button
							variant="outline"
							disabled={script?.name?.length < 1}
							on:click={(e) => onRenameScript()}
							icon={mdiUpdate}>Rename</Button
						>
					</div>
				</div>
			</div>

			<!-- Input -->
			{#if loadedScript.input != ''}
				<div class="py-1 text-secondary-900 dark:text-secondary-100">Input: {loadedScript.input}</div>
			{/if}
			<SelectField class="pt-2" bind:value={script.input} options={sources} label="Input" error={selectError} />

			<Checkbox class="pt-8" bind:checked={script.autoSave} label="Auto Save">Auto-Save</Checkbox>

			<!--  Script  -->
			<div class="h-60 pt-2 pb-2" style="overflow: auto">
				<h1 class="text-lg font-bold">Script:</h1>
				<TextField
					classes={{ input: 'h-40', container: 'h-40' }}
					debounceChange={500}
					multiline
					bind:value={script.script}
					class="w-full text-left text-lg h-20"
				/>
			</div>

			<Button on:click={onSave} variant="fill" color="primary">Save</Button>

			<slot />
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

<Drawer bind:open={snackbarOpen} placement="bottom" class="h-32">
	<h1 class="text-center py-8">{snackbarMessage}</h1>
	<div slot="actions">
		<Button on:click={() => (snackbarOpen = false)}>Close</Button>
	</div>
</Drawer>
