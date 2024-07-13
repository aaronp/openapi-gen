<script lang="ts">
	import { onMount } from 'svelte'
	import { latestData, api } from '$lib/session'
	import { sheetAsJson } from './util/sheetAsJson'
	import type { SaveScriptRequest, Script, Spreadsheet } from './generated'
	import { newSandbox, tidyUp, compile } from '$lib/util/execute'

	import { Drawer, Dialog, Tabs, Tab, Icon, Button, type MenuOption, Checkbox, TextField } from 'svelte-ux'
	import { mdiClose, mdiPin, mdiPinOff, mdiPlus, mdiUpdate } from '@mdi/js'

	function asOption(value: string): MenuOption {
		return { label: value, value: value }
	}

	let scriptNames: string[] = []
	let scriptName = ''

	let latestSheet = {}
	let latestJason = {}

	// tab stuff
	let currentTab = ''
	let deleteTab = ''
	let confirmDeleteOpen = false
	$: tabOptions = scriptNames.map((s) => asOption(s))

	let scriptOutput = ''

	// used for showing snackbars
	let snackbarOpen = false
	let snackbarMessage = ''

	let inner = 0
	let outer = 0

	const newScript = (): Script => {
		return {
			name: '',
			scriptPath: 'script.ts',
			script: '',
			autoSave: true,
			outputPath: 'output/openapi.yaml'
		}
	}
	let script: Script = newScript()

	latestData.subscribe((value) => {
		latestSheet = value
		latestJason = sheetAsJson(latestSheet as Spreadsheet)

		executeScript(latestJason)
	})

	function executeScript(input: any) {
		try {
			const iframe = newSandbox()
			try {
				const compiledCode = compile(script.script)

				// here we squirt in the functions we want to expose in the code
				iframe.contentWindow.input = input

				scriptOutput = iframe.contentWindow.eval(compiledCode)
			} catch (e) {
				scriptOutput = 'Error: ' + e
			} finally {
				tidyUp(iframe)
			}
		} catch (e) {}
	}

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

	async function reloadScript(n: string = scriptName) {
		script = await api.getScript({ name: n })
	}

	async function relistScripts(): Promise<string[]> {
		const all = await api.listScripts()
		console.log('all scripts: ', JSON.stringify(all))
		scriptNames = all.length < 1 ? ['New'] : all
		return scriptNames
	}

	async function onTabChange(value: string) {
		currentTab = value
		await reloadScript(value)

		executeScript(latestJason)

		scriptName = value
	}

	async function onAddNewScript(name: string) {
		await api.saveScript({ name, script: newScript() })

		await relistScripts()
	}

	async function onRenameScript({ detail }) {
		const oldName = scriptName
		const newName = currentTab
		try {
			const result = await api.renameScript({ name: oldName, newName: newName })
			showSnackbar(result.message ?? `Renamed ${oldName} to ${newName}`)
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

	function onUpdateScript({ detail }) {
		executeScript(latestJason)

		onSave()
	}

	async function onSave() {
		const request: SaveScriptRequest = { name: scriptName, script }
		await api.saveScript(request)
	}
</script>

<svelte:window bind:innerWidth={inner} bind:outerWidth={outer} />

<h1 class="text-lg font-bold">Input:</h1>
<div class="border h-96" style="overflow: auto">
	<pre>{JSON.stringify(latestJason, null, 2)}</pre>
</div>

<h1 class="py-2 text-lg font-bold">Transformations:</h1>

<Tabs placement="top" bind:options={tabOptions} on:change={(e) => (currentTab = e.detail.value)}>
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
						<TextField bind:value={currentTab} />
					</div>
					<div class="px-2 text-lg">
						<Button disabled={scriptName.length < 1} on:click={onRenameScript} icon={mdiUpdate}>Rename</Button>
					</div>
				</div>
			</div>

			<!--  Transformation -->
			<div class="h-3/4" style="overflow: auto">
				<!--  Script  -->
				<div class="h-40">
					<TextField
						on:change={onUpdateScript}
						classes={{ input: 'h-40', container: 'h-40' }}
						debounceChange={500}
						multiline
						bind:value={script.script}
						class="w-full text-left text-lg h-20"
					/>
				</div>

				<Checkbox class="pt-2" on:change={onSave} bind:checked={script.autoSave} label="Auto Save">Auto-Save</Checkbox>

				<!--  Ouptut Path -->
				<div class="pb-2">
					<div class="flex">
						<div class="pt-1 text-lg">Save To:</div>
						<div class="px-2">
							<TextField debounceChange on:change={onSave} bind:value={script.outputPath} />
						</div>
					</div>
				</div>

				<!--  Output -->
				<div class="py-2">
					<h1 class="text-lg font-bold">Output:</h1>
					<div class="border h-20" style="overflow: auto">
						<pre>{scriptOutput}</pre>
					</div>
				</div>
			</div>
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
