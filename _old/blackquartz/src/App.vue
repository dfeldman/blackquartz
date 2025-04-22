<!-- src/App.vue -->
<template>
  <div class="app-container">
    <ControlPanel class="control-panel" />
    <PreviewPanel class="preview-panel" />
  </div>
</template>

<script>
import ControlPanel from './components/ControlPanel.vue';
import PreviewPanel from './components/PreviewPanel.vue';

export default {
  name: 'App',
  components: {
    ControlPanel,
    PreviewPanel
  }
};
</script>

<style>
@import './assets/styles.css';
</style>