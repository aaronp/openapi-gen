<script lang="ts">
	import { onMount } from 'svelte'
	import { api } from '$lib/session'
	import type { Script } from './generated'
	import { inputSources, EverySheet } from '$lib/util/cache'
	import { SelectField, Drawer, Button, type MenuOption, Checkbox, TextField } from 'svelte-ux'
	import { mdiUpdate } from '@mdi/js'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let scriptName: string = ''
	let created = new Date().getMilliseconds()

	// HACK - for some reason, despite the display saying otherwise, the loadedScript.name and script.name
	// are IDENTICAL, so we capture the original name here
	let originalScriptName = ''
	let loadedScript: Script = {
		name: '',
		input: EverySheet,
		script: '',
		autoSave: false
	}
	let script: Script = loadedScript

	let sources: MenuOption[] = []
	let inputSource: MenuOption = { label: '', value: '' }

	// used for showing snackbars
	let snackbarOpen = false
	let snackbarMessage = ''

	onMount(async () => {
		console.log('creating with ' + scriptName)
		created = new Date().getMilliseconds()

		reloadScript(scriptName)
	})

	function showSnackbar(message: string, duration: number = 1000) {
		snackbarMessage = message
		snackbarOpen = true
		window.setTimeout(() => {
			snackbarOpen = false
		}, duration)
	}

	const onSave = async () => save()

	async function save() {
		if (script.input === script.name) {
			showSnackbar(`script ${script.name} depends on itself!`, 8000)
		} else if (!script.name) {
			showSnackbar(`Script name cannot be empty`, 8000)
		} else {
			const response = await api.saveScript({ script })
			showSnackbar(response.message ?? `Saved ${script.name}`)
			// await reloadScript(script.name)
		}
	}

	async function reloadScript(name: string) {
		loadedScript = await api.getScript({ name })
		originalScriptName = loadedScript.name
		script = loadedScript

		sources = await inputSources(name)
		inputSource = sources.find((s) => s.value === loadedScript.input) ?? sources[0]
	}

	async function onRenameScript(oldName: string, newName: string) {
		try {
			const requestParameters = { old: oldName, _new: newName }

			const result = await api.renameScript(requestParameters)
			dispatch('renameEvent', { oldName, newName });

			showSnackbar('Rename returned ' + JSON.stringify(result), 15000)
		} catch (e) {
			showSnackbar('Rename errored with ' + e, 15000)
		}

		await reloadScript(newName)
	}

	function onInputSourceChange() {
		script.input = inputSource?.value
	}
</script>

<h1>Loaded</h1>
<pre class="p-2">{JSON.stringify(loadedScript, null, 2)}</pre>

<h1>Script</h1>
<pre class="p-2">{JSON.stringify(script, null, 2)}</pre>

<div class="p-2">
	<!--  Script Name -->
	<div>
		<div class="flex pt-2">
			<div class="pt-1 pr-2 text-lg">Name:</div>
			<div>
				<TextField bind:value={script.name} />
				loadedScript.name: {loadedScript.name}
			</div>
			<div class="px-2 text-lg">
				<Button
					variant="outline"
					disabled={script?.name?.length < 1}
					on:click={(e) => onRenameScript(originalScriptName, script.name)}
					icon={mdiUpdate}>Rename</Button
				>
			</div>
		</div>
	</div>

	<!-- Input -->
	<SelectField
		class="pt-2"
		on:change={onInputSourceChange}
		bind:selected={inputSource}
		options={sources}
		label="Input"
	/>

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

<Drawer bind:open={snackbarOpen} placement="bottom" class="h-32">
	<h1 class="text-center py-8">{snackbarMessage}</h1>
	<div slot="actions">
		<Button on:click={() => (snackbarOpen = false)}>Close</Button>
	</div>
</Drawer>
