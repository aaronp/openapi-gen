import { writable } from 'svelte/store'
import { DefaultApi, Configuration, type Script } from '$lib/generated'

import { EverySheet, type StackElement } from '$lib/util/cache'

export const latestSheet = writable({})

export const api = new DefaultApi(new Configuration({ basePath: '' }))

export const emptyCallStack: StackElement[] = []
export const callStack = writable(emptyCallStack)
