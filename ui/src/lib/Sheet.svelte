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

  let isResizing = false
  let currentColumnIndex : number = -1
  let startX = 0
  let startWidth = 0
  let startWidthRight = 0

  function handleMouseDown(event, index) {
      isResizing = true
      currentColumnIndex = index
      startX = event.pageX
      startWidth = event.target.parentElement.offsetWidth
      startWidthRight = rightColumn().style.width
  }

  const movingColumn = () => document.querySelectorAll(".resizable-column")[currentColumnIndex]
  const rightColumn = () => document.querySelectorAll(".resizable-column")[currentColumnIndex + 1]

  const colSize = (idx : number) => document.querySelectorAll(".resizable-column")[idx]?.style?.width

  function handleMouseMove(event) {
      if (!isResizing) return;
      const dx = event.pageX - startX
      movingColumn().style.width = `${startWidth + dx}px`;
      rightColumn().style.width = `${startWidthRight - dx}px`;
  }

  function handleMouseUp() {
      isResizing = false;
  }

  onMount(() => {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
  });
  onDestroy(() => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
  });
</script>

<!-- <svelte:window on:mousemove={handleMouseMove} on:mousedown={handleMouseUp}/> -->

<div>startWidth: {startWidth}</div>
<div>startWidthRight: {startWidthRight}</div>
<table class="min-w-full border-collapse">
  <thead>
      <tr class="bg-gray-200">
          {#each columns as column, index}
              <th class="border p-2 resizable-column">
                  <div class="flex justify-between items-center">
                      <span>{column.label} {colSize(index)}</span>
                      {#if index < columns.length - 1}
                      <div
                          class="resizer bg-gray-400"
                          on:mousedown={(event) => handleMouseDown(event, index)}
                      ></div>
                      {/if}
                  </div>
              </th>
          {/each}
      </tr>
  </thead>
  <tbody>
      {#each data as row}
          <tr class="even:bg-gray-100">
              {#each columns as column}
                  {@const key = column.label}
                  <td class="border p-2">{key} : {row[key]}</td>
              {/each}
          </tr>
      {/each}
  </tbody>
</table>


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
