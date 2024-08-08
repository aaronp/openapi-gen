
export const toCamelCase = (input: string): string => {
	// Remove non-alphanumeric characters and split by space or underscore
	let words = input.replace(/[^a-zA-Z0-9 ]/g, '').split(/[\s_]+/)

	// Convert the first word to lowercase
	let camelCaseString = words[0].toLowerCase()

	// Capitalize the first letter of each subsequent word and append it to the result
	for (let i = 1; i < words.length; i++) {
		camelCaseString += words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase()
	}

	return camelCaseString
}

export const asIdentifier = (input: string) => toCamelCase(input ?? '').replace(/[ ]/g, '')

export const asTitleCase = (input: string) => input.replace(/[^a-zA-Z0-9]/g, '')