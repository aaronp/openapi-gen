<script lang="ts">
	import CallStack from '$lib/CallStack.svelte'
	import { Button } from 'svelte-ux'
	import ScriptSelect from '$lib/ScriptSelect.svelte'
	import type { Script, Spreadsheet } from '$lib/generated'

	import { upstreamDependencies, type StackElement } from '$lib/util/cache'
	import { latestSheet, api } from '$lib/session'
	import { sheetAsJson } from '$lib/util/sheetAsJson'
	import { evaluateStack, type StackResult } from '$lib/util/execute'
	import { mdiPlay } from '@mdi/js'

	let script = {}
	let sheet = {}
	let callStack: StackElement[] = []
	let latestResult: StackResult[] = []

	latestSheet.subscribe(async (value) => {
		sheet = sheetAsJson(value as Spreadsheet)
		callStack = []
		latestResult = []
	})

	async function onRun() {
		const input: Script = script as Script
		await api.saveScript({ script: input })
		callStack = await upstreamDependencies(input, sheet)
		latestResult = await evaluateStack(callStack)
	}
</script>

<ScriptSelect>
	<Button variant="fill-light" on:click={onRun} icon={mdiPlay}>Run</Button>

	{#if callStack.length > 0}
		<CallStack stack={latestResult} />
	{/if}
</ScriptSelect>
