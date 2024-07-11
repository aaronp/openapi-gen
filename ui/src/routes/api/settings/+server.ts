import type { UpdateSettingsRequest } from '$lib/generated'
import { saveSettings, readSettings } from '../db'

export async function GET({ request }: Request) {
	return Response.json(readSettings())
}

export async function POST({ request }: Request) {
	const response = await request
		.json()
		.then((data: UpdateSettingsRequest) => {
			console.log('Saving ', data, ' of type ', typeof data)
			try {
				const path = saveSettings(data)
				return Response.json({ path, message: 'Settings saved' })
			} catch (e) {
				console.error('ERROR saving settings', e)
				return Response.json({ message: 'ERROR saving json: ' + e, error: e }, { status: 500 })
			}
		})
		.catch((err: any) => {
			console.error('ERROR saving request', err)
			return Response.json({ message: 'ERROR saving request', err }, { status: 500 })
		})

	return response
}
