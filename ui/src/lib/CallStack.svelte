<script lang="ts">
	import { type StackResult } from '$lib/util/execute'
	import { Icon } from 'svelte-ux'
	import { mdiAlert, mdiCheckCircle } from '@mdi/js'
	import DownArrow from './DownArrow.svelte'

	export let stack: StackResult[] = []

	$: callStackArray = stack.map((elm, i) => {
		const input = i == 0 ? elm.element.input : elm.element.script.script
		return {
			input: JSON.stringify(input, null, 2),
			name: elm.element.script.name,
			result: JSON.stringify(elm.result),
			icon: elm.error ? mdiAlert : mdiCheckCircle
		}
	})
</script>

<div class="h-[40vh]" style="overflow:auto">
	{#each stack as item, i}
		<div class="mt-0.5 mx-2">
			<div class="text-lg">
				<Icon class="px-2" data={item.error ? mdiAlert : mdiCheckCircle} />{item.element.script.name}
			</div>
			<div class="text-sm">Input Variables: {item.inputs.join(',')}</div>
			<div class="font-mono text-sm h-20 border" style="overflow:auto">
				<h2>Input:</h2>
				<pre>{JSON.stringify(item.input, null, 2)}</pre>
			</div>
			<div class="text-surface-content/70 text-sm h-20" style="overflow:auto">
				<h2>Result:</h2>
				<div><pre>{JSON.stringify(item.result)}</pre></div>
			</div>
		</div>

		{#if i < callStackArray.length - 1}
			<DownArrow />
		{/if}
	{/each}
</div>
