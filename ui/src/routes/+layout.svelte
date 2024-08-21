<script lang="ts">
	import {
		AppBar,
		AppLayout,
		Toggle,
		Drawer,
		Button,
		NavItem,
		Tooltip,
		settings,
		ThemeInit,
		ThemeSelect
	} from 'svelte-ux'

	import {
		mdiClose,
		mdiCog,
		mdiTable,
		mdiScript,
		mdiWeb,
		mdiFileUpload,
		mdiPlus,
		mdiPencil,
		mdiDelete,
		mdiContentDuplicate
	} from '@mdi/js'
	import { onMount } from 'svelte'
	import { api } from '$lib/session'

	import { page } from '$app/stores'
	import '../app.postcss'
	import TwoCols from '$lib/TwoCols.svelte'
	import ScriptTabs from '$lib/ScriptTabs.svelte'
	import ImportData from '$lib/ImportData.svelte'
	import EditSheet from '$lib/EditSheet.svelte'
	import AddSheet from '$lib/AddSheet.svelte'

	let openImport = false
	let spreadsheets: string[] = []
	let stickyCode = false

	settings({
		components: {
			AppBar: {
				classes: 'bg-primary text-white shadow-md'
			},
			AppLayout: {
				classes: {
					nav: 'bg-neutral-800 py-2'
				}
			},
			NavItem: {
				classes: {
					root: 'text-sm text-gray-400 pl-6 py-2 hover:text-white hover:bg-gray-300/10 [&:where(.is-active)]:text-sky-400 [&:where(.is-active)]:bg-gray-500/10'
				}
			}
		}
	})

	$: currentSheetName = sheetNameFromUrl()

	const sheetNameFromUrl = () => {
		const url = $page.url.toString()
		const parts = url.split('/')
		if (parts.length > 2) {
			if (parts[parts.length - 2] == 'data') {
				return parts[parts.length - 1]
			}
		}
		return undefined
	}

	onMount(() => {
		relistSpreadsheets()
	})

	let editSheet: string = ''
	let editAction: 'copy' | 'delete' | 'rename' = 'rename'
	let addSheet = false

	function onEditSheet(name: string) {
		editSheet = name
		editAction = 'rename'
	}
	function onDeleteSheet(name: string) {
		editSheet = name
		editAction = 'delete'
	}
	function onCopySheet(name: string) {
		editSheet = name
		editAction = 'copy'
	}
	async function relistSpreadsheets(): Promise<string[]> {
		const all = await api.listSpreadsheets()
		spreadsheets = all.length < 1 ? ['New'] : all

		// side-effects on renaming/adding sheets
		editSheet = ''
		addSheet = false

		return spreadsheets
	}

	function toggleCodePanel() {
		stickyCode = !stickyCode
	}

	function onImport() {
		openImport = true
	}
	function onCloseImport() {
		openImport = false
	}
	function onImportComplete(msg) {
		relistSpreadsheets()
		openImport = false
	}

	function onAddSheet() {
		addSheet = true
	}
</script>

<ThemeInit />
<meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-eval';" />
<AppLayout>
	<svelte:fragment slot="nav">
		<div class="grid">

			{#each spreadsheets as sheetName}
				<div class="relative border-gray-300 cursor-pointer group">
					<div class="self-start">
						<NavItem path="/data/{sheetName}" text={sheetName} icon={mdiTable} currentUrl={$page.url} />
					</div>
					<Button
						icon={mdiPencil}
						class="absolute top-1/2 right-20 transform -translate-y-1/2 bg-blue-500 text-white py-1 rounded hidden group-hover:block"
						on:click={(e) => onEditSheet(sheetName)}
					></Button>

					<Button
						icon={mdiDelete}
						class="absolute top-1/2 right-10 transform -translate-y-1/2 bg-blue-500 text-white py-1 rounded hidden group-hover:block"
						on:click={(e) => onDeleteSheet(sheetName)}
					></Button>
					<Button
						icon={mdiContentDuplicate}
						class="absolute top-1/2 right-0 transform -translate-y-1/2 bg-blue-500 text-white py-1 rounded hidden group-hover:block"
						on:click={(e) => onCopySheet(sheetName)}
					></Button>
				</div>
			{/each}
			<div class="self-start ml-2 text-white">
				<Button icon={mdiPlus} rounded target="_blank" on:click={onAddSheet}>New Sheet</Button>
			</div>
		</div>
	</svelte:fragment>

	<AppBar title="Data Definition">
		<div slot="actions" class="flex gap-3">
			<Tooltip title="Import" placement="left" offset={2}>
				<Button icon={mdiFileUpload} rounded on:click={(e) => onImport()} target="_blank" />
			</Tooltip>

			<Tooltip title="Scripts" placement="left" offset={2}>
				<Button icon={mdiScript} rounded on:click={toggleCodePanel} target="_blank" />
			</Tooltip>

			<Tooltip title="Kind" placement="left" offset={2}>
				<Button icon={mdiWeb} href="https://kindservices.co.uk" class="p-2" target="_blank" />
			</Tooltip>

			<ThemeSelect />

			<Tooltip title="View repository" placement="left" offset={2}>
				<Button
					icon="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"
					href="https://github.com/aaronp/openapi-gen"
					class="p-2"
					target="_blank"
				/>
			</Tooltip>
		</div>
	</AppBar>

	<main class="p-2">
		{#if stickyCode}
			<TwoCols>
				<slot />
			</TwoCols>
		{:else}
			<Toggle let:on={open} let:toggle let:toggleOff>
				<Drawer {open} on:close={toggleOff} persistent class="w-[60vw] m-2 dark:bg-secondary-900 bg-secondary-100 pl-4">
					<div><ScriptTabs /></div>
					<div slot="actions">
						<Button icon={mdiClose} class="m-2 w-96" on:click={toggleOff}>Close</Button>
					</div>
				</Drawer>
				<slot />
				{#if $page.url.toString().endsWith('data')}
					<Button class="my-2" icon={mdiScript} variant="fill-light" on:click={toggle}>Script</Button>
				{/if}
			</Toggle>
		{/if}

		{#if editSheet != ''}
			<EditSheet
				sheet={editSheet}
				action={editAction}
				on:onClose={(e) => relistSpreadsheets()}
				on:onEdit={(e) => relistSpreadsheets()}
			/>
		{/if}

		{#if addSheet}
			<AddSheet on:onClose={(e) => relistSpreadsheets()} on:onAdd={(e) => relistSpreadsheets()} />
		{/if}

		<Drawer bind:open={openImport} placement="right" class="w-96">
			<h1 class="text-center py-8h-5/6">Import</h1>
			<div>
				<ImportData on:onImportComplete={onImportComplete} />
			</div>
			<div slot="actions">
				<Button on:click={onCloseImport}>Close</Button>
			</div>
		</Drawer>
	</main>
</AppLayout>
