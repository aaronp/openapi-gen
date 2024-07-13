import type { Spreadsheet } from '$lib/generated'
import { listSpreadsheets, saveSpreadsheet } from '../db'

export async function GET({ request }: Request) {
	return Response.json(listSpreadsheets())
}

export async function POST({ request }: Request) {
	const url = new URL(request?.url)

	const response = await request
		.json()
		.then((data: Spreadsheet) => {
			const name  = data.name
			console.log(`Saving spreadsheet ${name}: `)
			try {
				const path = saveSpreadsheet(data)
				return Response.json({ path, message: 'Spreadsheet saved' })
			} catch (e) {
				console.error('ERROR saving Spreadsheet', e)
				return Response.json({ message: 'ERROR saving json: ' + e, error: e }, { status: 500 })
			}
		})
		.catch((err: any) => {
			console.error('ERROR saving Spreadsheet', err)
			return Response.json({ message: 'ERROR saving Spreadsheet', err }, { status: 500 })
		})

	return response
}
