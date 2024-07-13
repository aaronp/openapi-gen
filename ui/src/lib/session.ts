import { writable, derived } from 'svelte/store'
import { DefaultApi, Configuration, type Script } from '$lib/generated'

import { EverySheet, type StackElement } from '$lib/util/cache'
export const latestSettings = writable({})
export const latestSheet = writable({})

export const api = new DefaultApi(new Configuration({ basePath: '' }))

export const emptyScript: Script = {
	name: '',
	script: '',
	input: EverySheet,
	autoSave: false
}

// the selected script, driving by the ScriptSelect component
export const scriptSelect = writable(emptyScript)

export const emptyCallStack: StackElement[] = []
export const callStack = writable(emptyCallStack)
