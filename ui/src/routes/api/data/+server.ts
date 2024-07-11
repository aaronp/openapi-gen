import type { SaveSpreadsheetRequest } from '$lib/generated'
import { listSpreadsheets } from '../db'

export async function GET({ request }: Request) {
	return Response.json(listSpreadsheets())
}
