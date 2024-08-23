import type { ScriptResult } from '$lib/generated'
import { saveResults, listScriptResults } from '../db'


export async function GET({ request }: Request) {
	console.log('list results')
	return Response.json(listScriptResults())
}


export async function POST({ request }: Request) {
	const url = new URL(request?.url)

	const response = await request
		.json()
		.then((data: ScriptResult) => {
			const name = data.name
			console.log(`Saving results ${data.dir ?? ''}/${name}: `)
			try {
				const path = saveResults(data)
				return Response.json({ path, message: 'Results saved' })
			} catch (e) {
				console.error('ERROR saving Results', e)
				return Response.json({ message: 'ERROR saving rsults: ' + e, error: e }, { status: 500 })
			}
		})
		.catch((err: any) => {
			console.error('ERROR saving Results', err)
			return Response.json({ message: 'ERROR saving Results', err }, { status: 500 })
		})

	return response
}
