import { writable, derived } from 'svelte/store'
import { DefaultApi, Configuration } from '$lib/generated'
import { sheetAsJson } from './util/sheetAsJson'
import { type Spreadsheet } from '$lib/generated/index' // Import the Spreadsheet type

export const latestSettings = writable({})
export const latestData = writable({})
export const currentSheet = writable({})

currentSheet.subscribe((sheet) => {
    console.log('FYI, sheeet ', sheet)
}
)
export const sheetJson = derived(
    [currentSheet],
    ([$sheet]) => {
        try {
            const result = sheetAsJson($sheet as Spreadsheet)
            console.log('computing sheeet ', JSON.stringify(result))
            return result
        } catch (e) {
            console.log('could not convert sheet to json', e)
            return {}
        }
    }
);

export const api = new DefaultApi(new Configuration({ basePath: '' }))
