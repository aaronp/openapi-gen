import { writable } from 'svelte/store'
import { DefaultApi, Configuration, type Script, type Spreadsheet } from '$lib/generated'

import { type StackElement } from '$lib/util/cache'

type JsonRows = { [key: string]: any }[];

export type SheetData = {
    sheet : Spreadsheet,
    data : JsonRows
}

// broadcasts SheetData
export const latestSheetData = writable({})

export const api = new DefaultApi(new Configuration({ basePath: '' }))

export const emptyCallStack: StackElement[] = []
export const callStack = writable(emptyCallStack)
