<template>
    <div>
      <div class="control-group">
        <h3>Export Options</h3>
        <button class="export-button" @click="$emit('export-css')">Export CSS</button>
        <button class="export-button" @click="$emit('export-html')">Export HTML Demo</button>
        <button class="export-button" @click="$emit('copy-css')">Copy CSS to Clipboard</button>
        <button class="export-button" @click="$emit('export-json')">Export Theme as JSON</button>
        <button class="export-button" @click="$emit('import-json')">Import Theme from JSON</button>
      </div>
      
      <div class="control-group">
        <h3>Theme Presets</h3>
        <button class="preset-button" @click="$emit('apply-preset', 'modern')">Modern Minimal</button>
        <button class="preset-button" @click="$emit('apply-preset', 'dark')">Dark Mode</button>
        <button class="preset-button" @click="$emit('apply-preset', 'newspaper')">Newspaper</button>
        <button class="preset-button" @click="$emit('apply-preset', 'magazine')">Magazine</button>
        <button class="preset-button" @click="$emit('apply-preset', 'colorful')">Colorful</button>
        <button class="preset-button" @click="$emit('apply-preset', 'elegant')">Elegant Serif</button>
        <button class="preset-button" @click="$emit('apply-preset', 'minimal')">Ultra Minimal</button>
        <button class="preset-button" @click="$emit('apply-preset', 'retro')">Retro Vibes</button>
        <button class="preset-button" @click="$emit('apply-preset', 'corporate')">Corporate</button>
        <button class="preset-button" @click="$emit('apply-preset', 'tech')">Tech Terminal</button>
        <button class="preset-button" @click="$emit('apply-preset', 'medical')">Medical Clean</button>
        <button class="preset-button" @click="$emit('apply-preset', 'legal')">Legal Brief</button>
        <button class="preset-button" @click="$emit('apply-preset', 'finance')">Finance Pro</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ExportControls',
    props: {
      theme: { type: Object, required: true }
    },
    emits: ['export-css', 'export-html', 'copy-css', 'export-json', 'import-json', 'apply-preset']
  };
  </script>
  