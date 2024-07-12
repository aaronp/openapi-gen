<script lang="ts">
	import { onMount } from 'svelte'
	import { latestSettings, latestData } from '$lib/session'
	import { sheetAsJson } from './util/sheetAsJson'
	import type { Spreadsheet } from './generated'

	import {
		Overflow,
		Drawer,
		Dialog,
		Tabs,
		Tab,
		Icon,
		Button,
		Input,
		SelectField,
		MultiSelectField,
		type MenuOption,
		Checkbox,
		TextField,
		Tooltip
	} from 'svelte-ux'

	onMount(() => {})

	let settings = {}
	latestSettings.subscribe((value) => {
		settings = value
	})

	let latestSheet = {}
	let latestJason = {}
	latestData.subscribe((value) => {
		latestSheet = value
		latestJason = sheetAsJson(latestSheet as Spreadsheet)
	})

	let inner = 0
	let outer = 0
</script>

<svelte:window bind:innerWidth={inner} bind:outerWidth={outer} />

<div>inner-width: {inner}px</div>
<div>outer-width: {outer}px</div>


<h1 class="text-lg font-bold">Input:</h1>
<div class="border h-96" style="overflow: auto">
	<pre>{JSON.stringify(latestJason, null, 2)}</pre>
</div>


<h1 class="text-lg font-bold">Transformations:</h1>
<Tabs>
</Tabs>