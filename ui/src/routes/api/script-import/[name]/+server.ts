import type { ScriptImport } from '$lib/generated'
import { readScriptImport } from '../../db'

export async function GET({ request }: Request) {
	const url = new URL(request?.url)
	const parts = url.pathname.split('/')
	const importName: string = parts.pop()!

	const script = readScriptImport(importName)
	if (script) {
		const result : ScriptImport = {
			importName,
			script,
		}
		return Response.json(result)
	} else {
		return Response.json({ importName, message: 'not found' }, { status: 404})
	}
}
