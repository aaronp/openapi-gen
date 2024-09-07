<script lang="ts">
	import { latestSheetData, api } from '$lib/session'
	import { onMount } from 'svelte'

	// the ID of the spreadsheet
	export let id: any

    let content = ''
    
	onMount(async () => {
		reloadOutput(id)
	})

	async function reloadOutput(n: string) {
		console.log('setting latest to ', n)
		content = await api.getSheetOutput({ name: n })

	}

</script>

<div class="w-full overflow-auto p-1 border">
{content}	
</div>