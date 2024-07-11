import { renameSheet, listSpreadsheets } from '../../../db'

export async function POST({ request }: Request) {
	const url = new URL(request?.url)
	const parts = url.pathname.split('/')
	const newName: string = parts.pop()!
	const name: string = parts.pop()!

	const path = renameSheet(name, newName)
	return Response.json(listSpreadsheets())
}
