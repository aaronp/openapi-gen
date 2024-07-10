// utils.js or any utility file
export function debounce(func, wait) {
	let timeout = 0
	return function (...args) {
		const context = this
		clearTimeout(timeout)
		timeout = setTimeout(() => func.apply(context, args), wait)
	}
}
