<script lang="ts">
	import { onMount } from 'svelte'
	 export let scriptName : string = ''
	 let created = new Date()
	 onMount(() => {
		created = new Date()
	 })
</script>

<h1>Script: {scriptName}</h1>
<h2>created: {created}</h2>