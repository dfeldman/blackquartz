<template>
  <div class="theme-json-viewer">
    <button class="open-viewer-btn" @click="openViewer">View Theme as JSON</button>
    <InputDetailComponent
      v-if="panelOpen"
      :visible="panelOpen"
      title="Theme JSON Viewer"
      :display-mode="defaultDisplayMode"
      @close="closeViewer"
    >
      <template #footer></template>
      <textarea class="theme-json-textarea" readonly :value="formattedTheme"></textarea>
    </InputDetailComponent>
  </div>
</template>

<script setup>
import { ref, computed, defineProps } from 'vue';
import InputDetailComponent from './InputDetailComponent.vue';

const props = defineProps({
  theme: { type: Object, required: true },
  defaultDisplayMode: { type: String, default: 'tearoff' }
});

const panelOpen = ref(false);

const openViewer = () => {
  panelOpen.value = true;
};

const closeViewer = () => {
  panelOpen.value = false;
};

const formattedTheme = computed(() => {
  return JSON.stringify(props.theme, null, 2);
});
</script>

<style scoped>
.theme-json-viewer {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.open-viewer-btn {
  padding: 8px 12px;
  font-size: 14px;
  background-color: #4a8bf5;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.open-viewer-btn:hover {
  background-color: #3a7ce5;
}

.theme-json-textarea {
  width: 100%;
  height: 100%;
  padding: 12px;
  font-family: monospace;
  font-size: 14px;
  border: none;
  resize: none;
  outline: none;
  box-sizing: border-box;
}
</style> 