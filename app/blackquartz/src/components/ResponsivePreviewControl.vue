<template>
    <div class="control-group">
      <h3>Responsive Preview</h3>
      <label class="checkbox-label">
        <input type="checkbox" v-model="responsivePreview.enabled">
        Enable Responsive Preview
      </label>
      <div v-if="responsivePreview.enabled">
        <div class="segmented-control">
          <input type="radio" id="device-desktop" value="desktop" v-model="responsivePreview.device">
          <label for="device-desktop">Desktop</label>
          <input type="radio" id="device-tablet" value="tablet" v-model="responsivePreview.device">
          <label for="device-tablet">Tablet</label>
          <input type="radio" id="device-mobile" value="mobile" v-model="responsivePreview.device">
          <label for="device-mobile">Mobile</label>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ResponsivePreviewControl',
    props: {
      responsivePreview: { type: Object, required: true }
    }
  };
  </script>
  