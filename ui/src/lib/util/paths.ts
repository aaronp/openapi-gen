export const idFromPath = (pathname: string) => {
	const parts = pathname.split('/').filter((p) => p.length > 0)
	if (parts.length < 2) {
		return ''
	} else {
		const id = parts.pop() ?? ''
		return id
	}
}
