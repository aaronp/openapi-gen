<script lang="ts">
	import type { SchemaField, Settings } from '$lib/generated/index'
	import { api, latestSettings } from '$lib/session'

	import { Card, Field, Button, Input, SelectField, type MenuOption } from 'svelte-ux'
	import { SchemaFieldTypeEnum } from '$lib/generated/index'

	import { tick, onMount } from 'svelte'
	import { availableParallelism } from 'os'

	function onSave() {
		console.log('onSave')

		
	}
	let settings : Settings = {
		urlPrefix: '',
		fields : []
	}
	onMount(async () => {
		settings = await api.getSettings()
	})
</script>

<main class="p-2">
	<h1>Data!</h1>
	{#each settings.fields as field}
		<div>{field.name}</div>
	{/each}
	<Button class="p-2" color="primary" variant="fill" rounded on:click={onSave}>Save</Button>
</main>
