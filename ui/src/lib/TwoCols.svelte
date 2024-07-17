<script lang="ts">
	import ScriptTabs from './ScriptTabs.svelte'
	import ResponsiveCols from './ResponsiveCols.svelte'
</script>

<ResponsiveCols>
	<div slot="left">
		<slot />
	</div>
	<div slot="right">
		<ScriptTabs />
	</div>
</ResponsiveCols>
