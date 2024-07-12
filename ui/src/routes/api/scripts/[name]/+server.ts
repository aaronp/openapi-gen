import type { Script } from '$lib/generated'
import { readScript, saveScript, deleteScript } from '../../db'

export async function GET({ request }: Request) {
	const url = new URL(request?.url)
	const parts = url.pathname.split('/')
	const name: string = parts.pop()!

	return Response.json(readScript(name))
}


export async function DELETE({ request }: Request) {
	const url = new URL(request?.url)
	const parts = url.pathname.split('/')
	const name: string = parts.pop()!

	console.log(`deleting script ${name}`)

	try {
		if (deleteScript(name)) {
			return Response.json({ message: `Deleted ${name}` })
		} else {
			return Response.json({ message: 'not found' }, { status: 404 })
		}
	} catch (e) {
		console.error('ERROR deleting Script', e)
		return Response.json({ message: 'ERROR deleting: ' + e, error: e }, { status: 500 })
	}
}


export async function POST({ request }: Request) {
	const url = new URL(request?.url)
	const parts = url.pathname.split('/')
	const name: string = parts.pop()!

	console.log(`Saving script ${name}`)

	return await request
		.json()
		.then((data: Script) => {
			try {
				const path = saveScript(name, data)
				console.log(`Saved ${name} to ${path}`)
				return Response.json({ path, message: `Saved ${name} to ${path}` })
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
