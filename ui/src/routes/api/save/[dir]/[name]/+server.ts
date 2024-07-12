import { saveData } from '../../../db'

export async function POST({ request }: Request) {
	const url = new URL(request?.url)
	const parts = url.pathname.split('/')
	const name: string = parts.pop()!
	const dir: string = parts.pop()!

	console.log(`Saving ${name} in ${dir}`)

	const response = await request
		.json()
		.then((data: any) => {
			try {
				const path = saveData(dir, name, JSON.stringify(data, null, 2))
				console.log(`Saved ${name} to ${path}`)
				return Response.json({ path, message: `Saved ${name} to ${path}` })
			} catch (e) {
				console.error('ERROR saving Spreadsheet', e)
				return Response.json({ message: 'ERROR saving json: ' + e, error: e }, { status: 500 })
			}
		})
		.catch((err: any) => {
			console.error('ERROR saving data', err)
			return Response.json({ message: 'ERROR saving data', err }, { status: 500 })
		})

	return response
}
