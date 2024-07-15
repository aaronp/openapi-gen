<script context="module">
	import { redirect } from '@sveltejs/kit'
	import { Shine, Icon } from 'svelte-ux'
	import { mdiScript } from '@mdi/js'
  
	export function load() {
	  throw redirect(307, '/data');
	}
</script>

<main class="p-2 content-center justify-self-center ">

<Shine>
	<h1 class="text-2xl font-semibold mb-2">Welcome to ✨Data Gen✨ !</h1>
	</Shine>
	<p class="text-lg">It's a json-backed spreadsheet to help drive your applications.</p>
	
	<p class="py-2">
		You can configure the columns (data types) in <a href="/settings">Settings</a>.
	</p>
	
	<p class="py-2">
		Once set, enter your <a href="/data">Data</a>, which is automatically savedt to your ./data directory.
	</p>
	
	<p class="py-2">
		If you'd like to generate downstream artifacts, (openapi contracts, user interfaces, etc), you can do so using <Icon data={mdiScript} /> Scripts.
	</p>
</main>