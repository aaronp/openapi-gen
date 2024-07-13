<script lang="ts">
	import CodePanel from './CodePanel.svelte'
	import ResponsiveCols from './ResponsiveCols.svelte'
  	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()
	function onToggleCodePanel(event) {
		console.log('TwoCols:onToggleCodePanel ')
		dispatch('toggleCodePanel')
	}
</script>

<ResponsiveCols>
	<div slot="left">
		<slot />
	</div>
	<div slot="right">
		<CodePanel pinned={true} on:toggleCodePanel={onToggleCodePanel} />
	</div>
</ResponsiveCols>
