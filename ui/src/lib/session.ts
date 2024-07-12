import { writable, derived } from 'svelte/store'
import { DefaultApi, Configuration } from '$lib/generated'
import { sheetAsJson } from './util/sheetAsJson'
import { type Spreadsheet } from '$lib/generated/index' // Import the Spreadsheet type

export const latestSettings = writable({})
export const latestData = writable({})
export const currentSheet = writable({})

export const sheetJson = derived(
    [currentSheet],
    ([$sheet]) => {
        try {
            return sheetAsJson($sheet as Spreadsheet)
        } catch (e) {
            console.log('could not convert sheet to json', e)
            return {}
        }
    }
);

export const api = new DefaultApi(new Configuration({ basePath: '' }))
