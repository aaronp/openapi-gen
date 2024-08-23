import type { ScriptResult } from '$lib/generated'
import { saveResults, readOutputContents } from '../../db'


export async function DELETE({ request }: Request) {
	console.log('delete results')
	const url = new URL(request?.url)
	const name: string = url.pathname.split('/').pop()!
	return Response.json({todo : "TODO!",  name}, { status: 500 })
}



export async function GET({ request }: Request) {
	const url = new URL(request?.url)
	const name: string = url.pathname.split('/').pop()!
	console.log(`get output for ${name}`)
	const contents = readOutputContents(name)
	if (contents) {
		return new Response(contents)	
	}
	return Response.json({message : "not found"}, { status: 404 })
}

