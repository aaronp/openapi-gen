import type { ScriptResult } from '$lib/generated'
import { saveResults, listScriptResults } from '../db'


export async function DELETE({ request }: Request) {
	console.log('delete results')
	const url = new URL(request?.url)
	const parts = url.pathname.split('/')
	const name: string = parts.pop()!
	const dir: string = parts.pop()!
	return Response.json({todo : "TODO!", dir, name}, { status: 500 })
}


export async function GET({ request }: Request) {
	const url = new URL(request?.url)
	const parts = url.pathname.split('/')
	const name: string = parts.pop()!
	const dir: string = parts.pop()!
	console.log(`get output for ${dir} / ${name}`)
	return Response.json({todo : "TODO!", dir, name}, { status: 500 })
}

