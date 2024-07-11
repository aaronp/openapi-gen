import type { SaveSpreadsheetRequest } from '$lib/generated'
import { saveSpreadsheet, readSpreadsheet } from '../db'

export async function GET({ request }: Request) {
	return Response.json(readSpreadsheet())
}

export async function POST({ request }: Request) {
	const response = await request
		.json()
		.then((data: SaveSpreadsheetRequest) => {
			console.log('Saving spreadsheet data ', data)
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
