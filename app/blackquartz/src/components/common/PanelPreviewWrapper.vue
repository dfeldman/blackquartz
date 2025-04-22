<template>
  <div class="panel-preview-wrapper" :class="{ large: size === 'large' }" @click="$emit('open')">
    <div class="preview" :style="{ width: '120px', height: '120px' }">
      <div class="preview-display" :style="previewStyle">
        <slot name="preview"></slot>
      </div>
    </div>
    <div class="details">
      <slot name="details">
        <div class="default-details">
          <div class="name">{{ label }}</div>
          <div class="info" v-if="info">{{ info }}</div>
          <div class="info" v-else>Select an option</div>
        </div>
      </slot>
    </div>
    <button v-if="clearEnabled" class="clear-btn" @click.stop="handleClear" title="Clear selection">×</button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  label: { type: String, default: 'Default Label' },
  size: { type: String, default: 'regular' },
  previewStyle: { type: Object, default: () => ({}) },
  info: { type: String, default: '' },
  clearEnabled: { type: Boolean, default: false }
});

const emit = defineEmits(['open', 'clear']);

const handleOpen = () => {
  emit('open');
};

const handleClear = () => {
  emit('clear');
};
</script>

<style scoped>
.panel-preview-wrapper {
  display: flex;
  align-items: center;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  background-color: #f5f5f5;
  transition: border-color 0.2s;
  max-width: fit-content;
}
.panel-preview-wrapper:hover {
  border-color: #aaa;
}
.panel-preview-wrapper.large {
  padding: 12px 8px;
}
.preview {
  width: 120px;
  height: 120px;
  margin-right: 12px;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  background-color: #eee;
  border-radius: 4px;
  overflow: hidden;
}
.preview-display {
  width: 100%;
  height: 100%;
}
.details {
  display: flex;
  flex-direction: column;
}
.default-details .name {
  font-weight: 500;
  margin-bottom: 2px;
}
.default-details .info {
  font-size: 12px;
  color: #666;
}
.clear-btn {
  background: none;
  border: none;
  color: #999;
  font-size: 18px;
  cursor: pointer;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  margin-left: 10px;
}
.clear-btn:hover {
  background-color: #f0f0f0;
  color: #555;
}
</style> 