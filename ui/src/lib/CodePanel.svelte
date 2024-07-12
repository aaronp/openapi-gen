<script lang="ts">
	import { onMount } from 'svelte'
	import { latestSettings, latestData } from '$lib/session'
	import { sheetAsJson } from './util/sheetAsJson'
	import type { Spreadsheet } from './generated'

	onMount(() => {})

	let settings = {}
	latestSettings.subscribe((value) => {
		settings = value
	})

	let latestSheet = {}
	let latestJason = {}
	latestData.subscribe((value) => {
		latestSheet = value
		latestJason = sheetAsJson(latestSheet as Spreadsheet)
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
<pre>{JSON.stringify(latestSheet, null, 2)}</pre>
</div>
