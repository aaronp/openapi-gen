<script lang="ts">
	import DebugPanel from './DebugPanel.svelte'
	import ResponsiveCols from './ResponsiveCols.svelte'
</script>

<ResponsiveCols>
	<div slot="left">
		<slot />
	</div>
	<div slot="right">
		<DebugPanel />
	</div>
</ResponsiveCols>
