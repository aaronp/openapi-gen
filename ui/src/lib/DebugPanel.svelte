<script lang="ts">
	import { onMount } from 'svelte'
	import { latestSettings, latestData } from '$lib/session'

	onMount(() => {})

	let settings = {}
	latestSettings.subscribe((value) => {
		settings = value
	})


	let data = {}
	latestData.subscribe((value) => {
		data = value
	})

	let inner = 0
	let outer = 0
</script>

<svelte:window bind:innerWidth={inner} bind:outerWidth={outer} />

<div>inner-width: {inner}px</div>
<div>outer-width: {outer}px</div>

<h2>Settings:</h2>
<pre>
    {JSON.stringify(settings, null, 2)}
</pre>

<h2>Data:</h2>
<pre>
    {JSON.stringify(data, null, 2)}
</pre>
