<script lang="ts">
	import { onMount } from 'svelte'
	import { latestSettings, latestData, sheetJson } from '$lib/session'

	onMount(() => {})

	let settings = {}
	latestSettings.subscribe((value) => {
		settings = value
	})

	let latestSheet = {}
	latestData.subscribe((value) => {
		latestSheet = value
	})

	
	let latestJason = {}
	sheetJson.subscribe((value) => {
		latestJason = value
	})
	let inner = 0
	let outer = 0
</script>

<svelte:window bind:innerWidth={inner} bind:outerWidth={outer} />

<div>inner-width: {inner}px</div>
<div>outer-width: {outer}px</div>

<div>Jason:
	<pre>{JSON.stringify(latestJason, null, 2)}</pre></div>

<div>
Sheet:
<pre>{JSON.stringify(latestSheet)}</pre>
</div>
