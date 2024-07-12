import * as ts from 'typescript'

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
