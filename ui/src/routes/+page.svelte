<script context="module">
	import { redirect } from '@sveltejs/kit'
	import { mdiCog, mdiTable, mdiScript } from '@mdi/js'
	import { Icon } from 'svelte-ux'
	export function load() {
		throw redirect(307, '/data')
	}
</script>

<main class="py-10 content-center justify-self-center">
	<div class="text-center">
		<h1 class="text-2xl font-semibold mb-2">Welcome to ✨Data Gen✨ !</h1>
	</div>
	<div class="px-10 ">
		<p class="pt-10 text-lg">This is just a basic 'spreadsheet for json', intended to give people more control over their data</p>

	<p class="py-10">
		First Configure <a href="/settings"><Icon data={mdiCog} /> Columns</a>, enter your <a href="/data"><Icon data={mdiTable} />Data</a>, and the data will be saved to your ./data directory.
	</p>

	<p class="py-2">
		If you'd like to generate downstream artifacts, (openapi contracts, user interfaces, etc), you can do so using <Icon
			data={mdiScript}
		/> Scripts.
	</p>
	</div>
</main>
