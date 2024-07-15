<script lang="ts">
	import { type ScriptResult } from '$lib/generated'
	import { type StackResult } from '$lib/util/execute'
	import { Button, Timeline, TimelineEvent } from 'svelte-ux'
	import { mdiAlert, mdiCircle, mdiCheckCircle, mdiDisc } from '@mdi/js'
	import { api } from './session'

	export let stack: StackResult[] = []

	$: callStackArray = stack.map((elm, i) => {
		// const input = i == 0 ? elm.element.input : stack[i - 1].result
		const input = i == 0 ? elm.element.input : elm.element.script.script
		return {
			input: JSON.stringify(input, null, 2),
			name: elm.element.script.name,
			result: JSON.stringify(elm.result),
			icon: elm.error ? mdiAlert : mdiCheckCircle
		}
	})

	async function onSaveResults() {
		const last = stack[stack.length - 1]
		const scriptResult: ScriptResult = {
			name: last.element.script.name,
			content: JSON.stringify(last.result)
		}
		await api.saveScriptResult({ scriptResult })
	}
</script>

<Timeline vertical snapPoint>
	{#each callStackArray as item, i}
		<TimelineEvent
			icon={item.icon}
			start={false}
			end={true}
			classes={{
				root: 'grid-cols-[40px,auto,1fr]',
				start: 'text-sm font-semibold mr-1',
				end: 'rounded-lg text-lg p-2 m-1',
				icon: 'size-5'
			}}
		>
			<div class="mt-0.5 mb-10 mx-2">
				<div class="font-mono italic text-sm h-20 border" style="overflow:auto">{item.input}</div>
				<div class="text-lg font-black">{item.name}</div>
				<div class="text-surface-content/70 text-sm h-20" style="overflow:auto">
					{item.result}
				</div>
			</div>
		</TimelineEvent>
	{/each}
</Timeline>

{#if callStackArray.length > 0}
	<div class="py-2">
		<Button variant="fill-light" on:click={onSaveResults} icon={mdiDisc}>Save Results</Button>
	</div>
{/if}
