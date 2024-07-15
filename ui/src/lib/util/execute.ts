import * as ts from 'typescript'
import type { StackElement } from './cache'

export type StackResult = {
	element: StackElement,
	input : any,
	error: boolean,
	inputs : string[],
	result: any
}

export function compile(code: string) {
	return ts.transpileModule(code, {
		compilerOptions: { module: ts.ModuleKind.ESNext }
	}).outputText
}

export function newSandbox() {
	// Use a sandboxed environment to execute the code
	const iframe = document.createElement('iframe')
	iframe.style.display = 'none'
	document.body.appendChild(iframe)
	// iframe.contentWindow
	return iframe
}

export function tidyUp(iframe) {
	document.body.removeChild(iframe)
}

export function executeCodeWithInput(code: string, inputs: Map<string, any>) {
	// Compile TypeScript to JavaScript
	const compiledCode = compile(code)

	// Use a sandboxed environment to execute the code
	const iframe = newSandbox()

	try {
		inputs.forEach((value, key) => {
			console.log(`setting input for key: ${JSON.stringify(key)} of type ${typeof key} value: >${value}<`)
			if (key) {
				iframe.contentWindow[key] = value
			}
		})

		console.log(`\COMPILED:`)
		console.log(`\t${code}`)
		console.log(`\tEXECUTING:`)
		console.log(compiledCode)

		return iframe.contentWindow.eval(compiledCode)
	} finally {
		tidyUp(iframe)
	}
}

export function executeCode(code: string) {
	// Compile TypeScript to JavaScript
	const compiledCode = compile(code)

	// Use a sandboxed environment to execute the code
	const iframe = newSandbox()

	try {
		return iframe.contentWindow.eval(compiledCode)
	} finally {
		tidyUp(iframe)
	}
}

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

// walk the array, filling in the 'result element' from the previous step
// (and stopping on error)
export async function evaluateStack(stack: StackElement[]): Promise<StackResult[]> {
	if (stack.length === 0) {
		return []
	}
	return await evaluateStackRecursive(stack, new Map<string, any>(), [], stack[0].input)
}

async function evaluateStackRecursive(
	stack: StackElement[],
	results: Map<string, any>,
	resultBuffer: StackResult[],
	lastResult: any
): Promise<StackResult[]> {
	if (stack.length === 0) {
		return resultBuffer
	}

	const head = stack[0]

	const inputsMap = new Map<string, any>()
	
	results.forEach((value, key) => {
		inputsMap.set(key, value)
	})
	
	inputsMap.set('input', lastResult)

	try {
		console.log(`executing w/ input map of size ${inputsMap.size}`)
		const result = await executeCodeWithInput(head.script.script, inputsMap)

		resultBuffer.push({
			element: head,
			error: false,
			input : lastResult,
			inputs : Array.from(inputsMap.keys()),
			result
		})

		if (head.script.input) {
			const key = toCamelCase(head.script.input)
			inputsMap.set(key, result)
		}

		const tail = stack.slice(1)
		const scriptKey = toCamelCase(head.script.name)
		return await evaluateStackRecursive(tail, inputsMap, resultBuffer, result)
	} catch (e) {
		console.error(`Error executing script: ${e}`)

		resultBuffer.push({
			element: head,
			error: true,
			input : lastResult,
			inputs : Array.from(inputsMap.keys()),
			result: { error: `${e}` }
		})

		return resultBuffer
	}
}
