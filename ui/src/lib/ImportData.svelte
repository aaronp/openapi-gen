<script lang="ts" >
    import {  parseCSV } from "./util/parseCsv"
	import type { CSV } from "./util/parseCsv"
    import {  TextField, Button } from 'svelte-ux'

    let fileName = ''
    let csv : CSV = {
        header: [],
        rows: []
    }
    let warningMessage = ""
  
    let fileContent = 'Drag and drop your CSV file here'

    function handleDrop(event) {
      event.preventDefault()
      
      const file = event.dataTransfer.files[0]
      fileName = file.name

      if (file && file.type === "text/csv") {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const result = e.target?.result ?? ""
            if (typeof result === "string") {
                fileContent = result
                csv = parseCSV(fileContent)
            } else if (result instanceof ArrayBuffer) {
                const decoder = new TextDecoder("utf-8")
                fileContent = decoder.decode(result)
                csv = parseCSV(fileContent)
            } else {
                warningMessage = `Hmm... this may be a bug. The dropped result was ${typeof result}. Just ignore it an go on with your life.`
            }
          } catch (e) {
            warningMessage = `Error parsing file: ${e}`
          }
        }

        reader.readAsText(file)
      } else {
        warningMessage = `Sorry - only .csv files are supported, not ${file.type}`
      }
    }


    async function onDoImport(event) {

    }
  
    function handleDragOver(event) {
      event.preventDefault()
    }
  </script>
  
  <h2 class="text-lg">CSV Content to import</h2>
  <h3 class="text-sm">(type or drag-and-drop a file)</h3>
  <div class="drop-area" on:drop={handleDrop} on:dragover={handleDragOver}>
    <TextField classes={{ input: 'h-96', container: 'h-96' }} multiline label="CSV" bind:value={fileContent} />
  </div>

  {#if warningMessage}
    <div class="text-red-500">{warningMessage}</div>
  {/if}

  {#if csv.header.length > 0}
    <Button on:click={onDoImport} variant="fill" color="primary">Import</Button>
  {/if}

  
  <style>
    .drop-area {
      border: 2px dashed #ccc;
      padding: 20px;
      text-align: center;
      margin: 20px 0;
    }
  
    .drop-area:hover {
      background-color: #f0f0f0;
    }
  </style>