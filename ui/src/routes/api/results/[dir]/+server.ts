import type { ScriptResult } from '$lib/generated'
import { saveResults, listScriptResultsForSheet } from '../../db'

export async function DELETE({ request }: Request) {
	console.log('delete results')
	const url = new URL(request?.url)
	const name: string = url.pathname.split('/').pop()!
	return Response.json({ todo: 'TODO!', name }, { status: 500 })
}

export async function GET({ request }: Request) {
	const url = new URL(request?.url)
	const name: string = url.pathname.split('/').pop()!
	const outputs = listScriptResultsForSheet(name)
	console.log(`list output for ${name} is ${outputs}`)
	return Response.json(outputs)
}
