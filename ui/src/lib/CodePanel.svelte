<script lang="ts">
	import { onMount } from 'svelte'
	import { latestSettings, latestData, api } from '$lib/session'
	import { sheetAsJson } from './util/sheetAsJson'
	import type { SaveScriptRequest, Script, Spreadsheet } from './generated'

	import {
		Overflow,
		Drawer,
		Dialog,
		Tabs,
		Tab,
		Icon,
		Button,
		Input,
		SelectField,
		MultiSelectField,
		type MenuOption,
		Checkbox,
		TextField,
		Tooltip
	} from 'svelte-ux'
	import { mdiClose, mdiPlus } from '@mdi/js'

	function asOption(value: string): MenuOption {
		return { label: value, value: value }
	}

	let scriptNames: string[] = []
	let scriptName = ''

	let settings = {}
	latestSettings.subscribe((value) => {
		settings = value
	})

	let latestSheet = {}
	let latestJason = {}

	// tab stuff
	let currentTab = ''
	let deleteTab = ''
	let confirmDeleteOpen = false
	$: tabOptions = scriptNames.map((s) => asOption(s))

	let script : Script = { 
		name: '', 
		scriptPath: 'script.ts',
		script: '',
		autoSave : true,
		outputPath : 'output/output.json'
	}


	latestData.subscribe((value) => {
		latestSheet = value
		latestJason = sheetAsJson(latestSheet as Spreadsheet)
	})


	onMount(async () => {

		const all = await relistScripts()

		scriptName = all[0]
		currentTab = scriptName
		reloadScript(scriptName)
	})

	function onRemoveTab(value: string) {
		deleteTab = value
		confirmDeleteOpen = true
	}

	async function reloadScript(n : string = scriptName) {
		script = await api.getScript({name : n})
	}

	async function relistScripts(): Promise<string[]> {
		const all = await api.listScripts()
		scriptNames = all.length < 1 ? ["New"] : all
		return scriptNames
	}

	function onTabChange(value : string) {
		currentTab = value
		reloadScript(value)
		scriptName = value
	}

	async function onAddNewScript(name : string) {
		
		const request : SaveScriptRequest = { name, script }

		await api.saveScript(request)

		await relistScripts()
	}

	async function onDoRemoveScript(tab: string) {
		// TODO - actually delete the script
		await relistScripts()
	}

	// used for showing snackbars
	let snackbarOpen = false
	let snackbarMessage = ''

	let inner = 0
	let outer = 0
</script>

<svelte:window bind:innerWidth={inner} bind:outerWidth={outer} />


<h1 class="text-lg font-bold">Input:</h1>
<div class="border h-96" style="overflow: auto">
	<pre>{JSON.stringify(latestJason, null, 2)}</pre>
</div>

<h1 class="text-lg font-bold">Transformations:</h1>

<Tabs placement="bottom" bind:options={tabOptions} on:change={(e) => (currentTab = e.detail.value)}>
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

	<Tab on:click={(e) => onAddNewScript(`New-${scriptNames.length}`)}>
		<Icon data={mdiPlus} class="rounded-full p-0.5 hover:bg-surface-content/5" />
	</Tab>

	<svelte:fragment slot="content">
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
