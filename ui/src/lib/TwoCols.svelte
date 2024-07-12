<script lang="ts">
	import CodePanel from './CodePanel.svelte'
	import DebugPanel from './DebugPanel.svelte'
	import ResponsiveCols from './ResponsiveCols.svelte'
</script>

<ResponsiveCols>
	<div slot="left">
		<slot />
	</div>
	<div slot="right">
		<!-- <DebugPanel /> -->
		<CodePanel />
	</div>
</ResponsiveCols>
