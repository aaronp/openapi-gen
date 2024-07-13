<script lang="ts">
	import { executeCode, newSandbox, tidyUp, compile } from '$lib/util/execute'
	import { onMount } from 'svelte'
	import * as ts from 'typescript'

	let codeInput = `console.log("Hello, world!");`
	let output = ''

	function callMe() {
		console.log('callMe')
		alert('callMe')
	}

	function runCallMe(code: string) {
		const compiledCode = compile(code)

		const iframe = newSandbox()

		// here we squirt in the functions we want to expose in the code
		iframe.contentWindow.callMe = callMe

		try {
			return iframe.contentWindow.eval(compiledCode)
		} finally {
			tidyUp(iframe)
		}
	}

	const run = (code: string) => (output = executeCode(code))
</script>

<textarea bind:value={codeInput}></textarea>
<button on:click={(e) => run(codeInput)}>Execute</button>
<button on:click={(e) => runCallMe(codeInput)}>Call Me</button>
<p>{output}</p>

<style>
	textarea {
		width: 100%;
		height: 150px;
	}
</style>
