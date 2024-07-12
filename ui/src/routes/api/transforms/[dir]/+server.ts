import { saveData } from '../../db'


export async function GET({ request }: Request) {
	const url = new URL(request?.url)
	const parts = url.pathname.split('/')
	const dir: string = parts.pop()!

}