<script lang="ts">
  import { onMount, onDestroy } from "svelte"

  type Col = {
    width : number,
    label : string
  }
  
  const col = (label : string, width : number = 150) : Col => {
    return { label : label, width }
  }

  let columns: Col[] = [col("Name"), col("Age"), col("Occupation")]
  let data  = [
      { Name: "John Doe", Age: 28, Occupation: "Developer" },
      { Name: "Jane Smith", Age: 34, Occupation: "Designer" },
      { Name: "Sam Johnson", Age: 25, Occupation: "Manager" },
  ];

  $: tableWidth = columns.map(c => c.width).reduce((acc, v) => acc + v, 0)

  let isResizing = false
  let currentColumn: Col | null = null;
  let startX = 0
  let startWidth = 0

  function handleMouseDown(event, col : Col) {
      console.log('onMouseDown ', col)
      isResizing = true
      currentColumn = col
      startX = event.pageX
      startWidth = col.width
  }

  function handleMouseMove(event) {
      if (!isResizing || !currentColumn) return;
      const dx = event.pageX - startX
      const newWidth = startWidth + dx
      currentColumn.width = Math.max(newWidth, 100)
      columns = [...columns]
      
  }

  function handleMouseUp() {
      isResizing = false
      currentColumn = null
  }

  // onMount(() => {
  //   if (window) {
  //     window.addEventListener("mousemove", handleMouseMove);
  //     window.addEventListener("mouseup", handleMouseUp);
  //   }
  // });
  // onDestroy(() => {
  //   if (window){
  //     window.removeEventListener("mousemove", handleMouseMove);
  //     window.removeEventListener("mouseup", handleMouseUp);
  //   }
  // });
</script>


<svelte:window on:mousemove={handleMouseMove} on:mouseup={handleMouseUp} />

<div class="w-full overflow-auto p-1 border">
  <table class="border-collapse " style={`width: ${tableWidth}px;`}>
    <thead>
        <tr class="dark:bg-gray-800 bg-gray-200" >
            {#each columns as column, index}
                <th class="border p-2 resizable-column" style={`width: ${col.width}px;`}>
                    <div class="flex justify-between items-center">
                        <span>{column.label}</span>
                        <div
                            class="resizer dark:bg-gray-900 bg-gray-400"
                            on:mousedown={(event) => handleMouseDown(event, column)}
                        ></div>
                    </div>
                </th>
            {/each}
        </tr>
    </thead>
    <tbody>
        {#each data as row}
            <tr class="even:dark:bg-gray-500 even:bg-gray-100">
                {#each columns as col}
                    {@const key = col.label}
                    <td class="border p-2"  style={`width: ${col.width}px;`}>{key} : {row[key]?.toString()}</td>
                {/each}
            </tr>
        {/each}
    </tbody>
  </table>
</div>


<style>

  .resizable-column {
      position: relative;
      overflow: hidden;
  }
  .resizer {
      position: absolute;
      top: 0;
      right: 0;
      width: 5px;
      height: 100%;
      cursor: col-resize;
      user-select: none;
  }
</style>
