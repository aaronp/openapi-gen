<script context="module">
	// retain module scoped expansion state for each tree node
	const _expansionState = {
		/* treeNodeId: expanded <boolean> */
	}
</script>

<script>
    export let isRoot = false
	export let tree
	const {label, children} = tree

	// @ts-ignore
	let expanded = _expansionState[label] || isRoot
	const toggleExpansion = () => {
        // @ts-ignore
		expanded = _expansionState[label] = !expanded
	}
	$: arrowDown = expanded
</script>

	<ul class:root={isRoot}>
		<li>
			{#if children && children.length > 0}				
				{#if !isRoot}
					<span 
					>
						<span 
						on:click={toggleExpansion} 
						on:keydown={(e) => e.key === 'Enter' && toggleExpansion()}
						role="button" 
						tabindex="0" class="arrow" class:arrowDown>&#x25b6</span>
						
						{label} ({isRoot})
					</span>
				{/if}
				
				{#if expanded }
					{#each children as child}
						<svelte:self tree={child} isRoot={false}/>
					{/each}
				{/if}
			{:else}
				<span>
					<span class="no-arrow"/>
					{label}
				</span>
			{/if}
		</li>
	</ul>

<style>
	ul {
		margin: 0;
		list-style: none;
		padding-left: 1.2rem;
		user-select: none;
	}
	.no-arrow { padding-left: 1.0rem; }
	.arrow {
		cursor: pointer;
		display: inline-block;
		/* transition: transform 200ms; */
	}
	.arrowDown { transform: rotate(90deg); }
	.root {
		padding-left: 0;
	}
</style>
