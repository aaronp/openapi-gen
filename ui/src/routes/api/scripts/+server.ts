import { listScripts, saveScript } from '../db'
import type { Script } from '$lib/generated'

export async function GET({ request }: Request) {
	return Response.json(listScripts())
}

export async function POST({ request }: Request) {
	return await request
		.json()
		.then((data: Script) => {
			try {
				console.log('SAVING script ', JSON.stringify(data, null, 2))
				const path = saveScript(data.name, data)
				console.log(`Saved ${data.name} to ${path}`)
				return Response.json({ path, message: `Saved ${data.name} to ${path}` })
			} catch (e) {
				console.error('ERROR saving Script', e)
				return Response.json({ message: 'ERROR saving json: ' + e, error: e }, { status: 500 })
			}
		})
		.catch((err: any) => {
			console.error('ERROR saving data', err)
			return Response.json({ message: 'ERROR saving script', err }, { status: 500 })
		})
}
