import { writable } from 'svelte/store'
import { DefaultApi, Configuration } from '$lib/generated'

export const latestSettings = writable({})
export const latestData = writable({})

export const api = new DefaultApi(new Configuration({ basePath: '' }))
