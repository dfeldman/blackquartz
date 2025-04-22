<template>
    <div class="preview" :class="{'responsive-mode': theme.responsivePreview ? theme.responsivePreview.enabled : false}">
      <div class="device-wrapper" v-if="theme.responsivePreview.enabled" :class="'device-' + theme.responsivePreview.device">
        <iframe ref="previewFrame"></iframe>
      </div>
      <iframe v-else ref="previewFrame"></iframe>
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ThemePreview',
    props: {
      theme: { type: Object, required: true },
      editorState: { type: Object, required: true },
      isLoading: { type: Boolean, default: false }
    },
    methods: {
      updatePreview(cssCode, htmlContent) {
        const iframe = this.$refs.previewFrame;
        if (!iframe || !iframe.contentDocument) {
          console.warn('Preview iframe not ready.');
          return;
        }
  
        const iframeDoc = iframe.contentDocument;
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            ${this.theme.loadedFonts.map(font => `<link href="${font}" rel="stylesheet">`).join('\n')}
            <style>${cssCode}</style>
          </head>
          <body>
            ${htmlContent}
          </body>
          </html>
        `);
        iframeDoc.close();
      }
    }
  };
  </script>
  