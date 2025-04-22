<template>
  <div class="div-control-panel">
    <div class="div-control-header">
      <h2>{{ sectionTitle }}</h2>

    </div>
    <div>
      <!-- Border control -->
      <BorderStyleInput v-model="border" :editor-state="editorState" :theme="theme" />

      <!-- Spacing control -->
      <SpacingEditor v-model="spacing" label="Spacing" />

      <!-- Font control -->
      <FontInput v-model="font" />

      <!-- Background selection and control -->
      <div class="background-section">
        <label for="background-select">Background Type:</label>
        <select id="background-select" v-model="backgroundType">
          <option value="solid">Solid Color</option>
          <option value="gradient">Gradient</option>
          <option value="image">Image</option>
          <option value="cssPattern">CSS Pattern</option>
        </select>
        <!-- Dynamically render the background control based on the selected type -->
        <component :is="currentBackgroundControl" v-model="backgroundValue" :theme="theme" />
      </div>
    </div>
  </div>
</template>

<script setup>
/* globals defineProps, defineEmits */

import { computed, ref, watch } from 'vue';
import BorderStyleInput from './BorderStyleInput.vue';
import SpacingEditor from './SpacingEditor.vue';
import FontInput from './FontInput.vue';
import SolidBackgroundSelector from './SolidBackgroundSelector.vue';
import ThemedGradientInput from './ThemedGradientInput.vue';
import PatternBackgroundSelector from './PatternBackgroundSelector.vue';
import ImageBackgroundSelector from './ImageBackgroundSelector.vue';

// Use v-model by accepting a modelValue prop and emitting updates.
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      border: {},
      spacing: {},
      font: {
        family: '',
        category: '',
        size: 16,
        weight: 400,
        effect: 'none',
        axes: {}
      },
      background: {
        type: 'solid',
        value: {}
      }
    })
  },
  theme: {
    type: Object,
    default: () => ({})
  },
  editorState: { type: Object, required: true },
  sectionTitle: {
    type: String,
    default: ''
  }
});
const emit = defineEmits(['update:modelValue']);

// Internal reactive state for each sub-control.
const border = ref(props.modelValue.border);
const spacing = ref(props.modelValue.spacing || {});
const font = ref(props.modelValue.font);
const backgroundType = ref(props.modelValue.background?.type || 'solid');
const backgroundValue = ref(props.modelValue.background?.value || {});

const currentBackgroundControl = computed(() => {
  switch (backgroundType.value) {
    case 'solid':
      return SolidBackgroundSelector;
    case 'gradient':
      return ThemedGradientInput;
    case 'image':
      return ImageBackgroundSelector;
    case 'cssPattern':
      return PatternBackgroundSelector;
    default:
      return SolidBackgroundSelector;
  }
});

// Compute the overall style output.
const styleOutput = computed(() => ({
  border: border.value,
  spacing: spacing.value,
  font: font.value,
  background: {
    type: backgroundType.value,
    value: backgroundType.value === 'solid' && Object.keys(backgroundValue.value).length === 0
      ? { color: '#ffffff', opacity: 1 }
      : backgroundValue.value
  }
}));

// Watch for changes to the style output and propagate them using v-model.
watch(
  styleOutput,
  (newVal) => {
    emit('update:modelValue', newVal);
  },
  { deep: true }
);

const isCollapsed = ref(false);
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>

<style scoped>
.div-control-panel {
  border: 1px solid #ccc;
  padding: 10px;
}
.background-section {
  margin-top: 10px;
}
.div-control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.collapse-toggle {
  background: none;
  border: none;
  font: inherit;
  cursor: pointer;
  outline: inherit;
}
</style>