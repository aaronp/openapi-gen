import { readScript, deleteScript } from '../../db'

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
