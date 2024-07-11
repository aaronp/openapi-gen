<script>
    import { onMount } from 'svelte';
    import * as ts from 'typescript';
  
    let code = `console.log("Hello, world!");`;
    let output = '';
  

    function callMe() {
      console.log('callMe');
    }

    function executeCode() {
      try {
        // Compile TypeScript to JavaScript
        const compiledCode = ts.transpileModule(code, {
          compilerOptions: { module: ts.ModuleKind.ESNext }
        }).outputText;
  
        // Use a sandboxed environment to execute the code
        const iframe = document.createElement('iframe')
        iframe.style.display = 'none'
        document.body.appendChild(iframe)
        const iframeWindow = iframe.contentWindow
        
        iframeWindow.callMe = callMe
        const result = iframeWindow.eval(compiledCode)

        eval("console.log('Hello from eval!')")
  
        output = 'Code executed successfully with: ' + result;
      } catch (error) {
        output = `Error: ${error.message}`;
      }
    }
  </script>
  
  <main>

    <textarea bind:value={code}></textarea>
    <button on:click={executeCode}>Execute</button>
    <p>{output}</p>
    
  </main>


  <style>
    textarea {
      width: 100%;
      height: 150px;
    }
  </style>
  