<script lang="ts">
	import CodePanel from './CodePanel.svelte'
	import ResponsiveCols from './ResponsiveCols.svelte'
</script>

<ResponsiveCols>
	<div slot="left">
		<slot />
	</div>
	<div slot="right">
		<CodePanel />
	</div>
</ResponsiveCols>
