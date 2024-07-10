<script lang="ts">
	import { onMount } from 'svelte'

	onMount(() => {
	
	})

	let inner = 0
	let outer = 0
</script>

<svelte:window bind:innerWidth={inner} bind:outerWidth={outer} />

<div>inner-width: {inner}px</div>
<div>outer-width: {outer}px</div>

<h2>Settings:</h2>
<pre>
    {JSON.stringify({})}
</pre>
