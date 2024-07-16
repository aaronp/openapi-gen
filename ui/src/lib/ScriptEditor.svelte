<script lang="ts">
	import { onMount } from 'svelte'
	import { api } from '$lib/session'
	import type { Script } from './generated'
	import { EverySheet } from '$lib/util/cache'

	 export let scriptName : string = ''
	 let created = new Date().getMilliseconds()
	 let loadedScript: Script = {
			name: '',
			input: EverySheet,
			script: '',
			autoSave: false
		}
	 let script: Script
	 onMount(async () => {
		console.log('creating with ' + scriptName)
		created = new Date().getMilliseconds()
		
		loadedScript = await api.getScript({ name : scriptName })
		script = loadedScript
	 })

</script>

scriptName : {scriptName}
<h1>Script: <pre>{JSON.stringify(loadedScript)}</pre></h1>
