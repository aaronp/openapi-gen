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
	import { mdiClose, mdiPlus, mdiUpdate } from '@mdi/js'

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


	// used for showing snackbars
	let snackbarOpen = false
	let snackbarMessage = ''

	let inner = 0
	let outer = 0

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
		console.log("all scripts: ", JSON.stringify(all))
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

		const response = await api.saveScript(request)
		
		showSnackbar(`onAdd >${name}< returned ` + JSON.stringify(response))

		await relistScripts()
	}

	async function onRenameScript({detail}){
		const oldName = scriptName
		const newName = currentTab
		try {
			const result = await api.renameScript({name : oldName, newName : newName})
			showSnackbar(result.message ?? "Rename returned " + JSON.stringify(result))
		} catch (e) {
			showSnackbar("Rename errored with " + e, 15000)
		}

		await relistScripts()
	}
	async function onDoRemoveScript(tab: string) {
		await api.deleteScript({name : tab})
		showSnackbar('Deleted ' + tab)
		await relistScripts()
	}


	function showSnackbar(message : string, duration : number = 1000) {
		snackbarMessage = message
		snackbarOpen = true
		window.setTimeout(() => {
			snackbarOpen = false
		}, duration)
	}
</script>

<svelte:window bind:innerWidth={inner} bind:outerWidth={outer} />


<h1 class="text-lg font-bold">Input:</h1>
<div class="border h-96" style="overflow: auto">
	<pre>{JSON.stringify(latestJason, null, 2)}</pre>
</div>

<h1 class="text-lg font-bold">Transformations:</h1>

<div>
	<div class="flex">
		<div class="px-2 pt-1 text-lg mb-12">Script:</div>
		<div >
			<TextField bind:value={currentTab} />
		</div>
		<div  class="px-2 text-lg">
			<Button disabled={scriptName.length < 1}  on:click={onRenameScript} icon={mdiUpdate} >Rename</Button>
		</div>
	</div>
</div>

<div class="h-1/2" style="overflow: auto">
	<div>Tab : {currentTab}</div>
	<div>script: {script.script}</div>
	<div>scriptName: {scriptName}</div>
</div>

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

	<Tab on:click={(e) => onAddNewScript(`New-${scriptNames.length + 1}`)}>
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
