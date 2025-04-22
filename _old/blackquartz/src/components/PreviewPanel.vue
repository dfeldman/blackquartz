<!-- src/components/PreviewPanel.vue -->
<template>
    <div class="preview-frame-container">
      <iframe 
        ref="previewFrame" 
        class="preview-frame"
        sandbox="allow-scripts"
        title="Style Preview"
      ></iframe>
    </div>
  </template>
  
  <script>
  export default {
    name: 'PreviewPanel'
  };
  </script>