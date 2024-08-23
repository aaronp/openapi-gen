import type { ScriptResult } from '$lib/generated'
import { saveResults, listScriptResults } from '../db'


export async function DELETE({ request }: Request) {
	console.log('delete results')
	const url = new URL(request?.url)
	const name: string = url.pathname.split('/').pop()!
	return Response.json({todo : "TODO!",  name}, { status: 500 })
}


export async function GET({ request }: Request) {
	console.log(`get output ...`)
	const url = new URL(request?.url)
	const name: string = url.pathname.split('/').pop()!
	console.log(`get output for ${name}`)
	return Response.json({todo : "TODO!", name})
}

