<script lang="ts">
	import ColHeader from '$lib/ColHeader.svelte'
	import { SchemaFieldTypeEnum, type SchemaField } from '$lib/generated/index'
	let schema: SchemaField = {
		name: 'Test',
		type: SchemaFieldTypeEnum.Text
	}
	function schemaUpdated({ detail }: any) {
		schema = detail as SchemaField
	}
	function moveRight(event) {
		schema.name = 'move right'
	}
	function moveLeft(event) {
		schema.name = 'move left'
	}
</script>

{JSON.stringify(schema, null, 4)}
<ColHeader {schema} on:moveRight={moveRight} on:moveLeft={moveLeft} on:schemaUpdated={schemaUpdated} />
