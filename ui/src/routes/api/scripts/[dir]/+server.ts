import { listScripts } from '../../db'

export async function GET({ request }: Request) {
	return Response.json(listScripts())
}
