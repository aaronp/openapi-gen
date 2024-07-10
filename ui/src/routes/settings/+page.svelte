<script lang="ts">
	import type { Settings } from '$lib/generated/index'
	import { latestSettings } from '$lib/session'

	import { Card, Field, Button, Input, Icon, saveAs } from 'svelte-ux'
	let settings: Settings = {
		urlPrefix: '/api/v1',
		fields: []
	}

	// latestSettings.subscribe((value) => {
	// 	settings = value
	// })

    function save() {
        latestSettings.set(settings)
    }
    
	const onAddField = () => {
		settings.fields = [
			...settings.fields,
			{
				name: 'New Field',
				type: 'string'
			}
		]

        save()
	}

</script>

<main class="p-2">
	<h1>Settings!</h1>
	<pre>{JSON.stringify(settings, null, 2)}</pre>
	<Button class="p-2" color="secondary" variant="outline" rounded on:click={onAddField}>Add</Button>

	{#each settings.fields as field}
		<div class="grid grid-cols-[auto,1fr,auto] gap-2">
			<Card>
				<Field label="Name" let:id>
					<Input {id} replace="fieldname" bind:value={field.name} />
				</Field>
			</Card>
			<Card>
				<Field label="Type" let:id>
					<Input {id} replace="type" bind:value={field.name} />
				</Field>
			</Card>
		</div>
	{/each}
</main>
