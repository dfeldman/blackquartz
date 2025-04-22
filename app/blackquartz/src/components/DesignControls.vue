<template>
  <div>
    <!-- Color Theme Control Group -->
    <control-group 
      title="Color Theme" 
      :collapsed="collapsedGroups.colorTheme" 
      @toggle="$emit('toggle-group', 'colorTheme')"
    >
      <button @click="$emit('open-color-theme')" class="export-button" style="margin-bottom: 15px;">
        <i class="fas fa-palette"></i> Edit Color Theme
      </button>
      <div class="color-theme-preview">
        <div class="theme-row">
          <span>Light Mode</span>
          <div class="theme-colors">
            <div 
              v-for="(color, index) in theme.colorTheme?.light?.slice(0, 8) || []" 
              :key="`light-${index}`"
              class="theme-color" 
              :style="{ backgroundColor: color }"
            ></div>
          </div>
        </div>
        <div class="theme-row">
          <span>Dark Mode</span>
          <div class="theme-colors">
            <div 
              v-for="(color, index) in theme.colorTheme?.dark?.slice(0, 8) || []" 
              :key="`dark-${index}`"
              class="theme-color" 
              :style="{ backgroundColor: color }"
            ></div>
          </div>
        </div>
      </div>
    </control-group>
    
    <!-- Body Style Control Group -->
    <control-group 
      title="Body Style" 
      :collapsed="collapsedGroups.bodyStyle" 
      @toggle="$emit('toggle-group', 'bodyStyle')"
    >
      <DivControl v-model="localTheme.bodyStyle" :theme="localTheme" :editor-state="editorState" />
    </control-group>
    
    <!-- Page Style Control Group -->
    <control-group 
      title="Page Style" 
      :collapsed="collapsedGroups.pageStyle" 
      @toggle="$emit('toggle-group', 'pageStyle')"
    >
      <DivControl v-model="localTheme.pageStyle" :theme="localTheme" :editor-state="editorState" />
    </control-group>
    
    <!-- Theme JSON Viewer Control Group -->
    <control-group 
      title="Theme JSON" 
      :collapsed="collapsedGroups.themeJson" 
      @toggle="$emit('toggle-group', 'themeJson')"
    >
      <ThemeJsonViewer :theme="theme" default-display-mode="tearoff" />
    </control-group>
  </div>
</template>

<script>
import ControlGroup from './controls/ControlGroup.vue';
import SliderInput from './controls/SliderInput.vue';
import CheckboxInput from './controls/CheckboxInput.vue';
import ThemedColorInput from './controls/ThemedColorInput.vue';
import { getBackgroundStyle } from '../services/CSSStyleGenerator';
import ThemeUtils from '../services/ThemeUtils';
import FontInput from './controls/FontInput.vue';
import ShapeEditor from './editors/ShapeEditor.vue';
import ColorThemeInput from './controls/ColorThemeInput.vue';
import SectionBreakInput from './controls/SectionBreakInput.vue';
import BorderStyleInput from './controls/BorderStyleInput.vue';
import PicsumImageSelector from './controls/PicsumImageSelector.vue';
import ThemedGradientInput from './controls/ThemedGradientInput.vue';
import PatternBackgroundSelector from './controls/PatternBackgroundSelector.vue';
import DivControl from './controls/DivControl.vue';
import ThemeJsonViewer from './controls/ThemeJsonViewer.vue';

export default {
  name: 'DesignControls',
  components: {
    ControlGroup,
    DivControl,
    ThemeJsonViewer
  },
  props: {
    theme: { type: Object, default: () => ({}) },
    editorState: { type: Object, required: true },
    collapsedGroups: { type: Object, required: true }
  },
  emits: ['toggle-group', 'open-background', 'open-font', 'open-color', 'open-color-theme', 'update:theme'],
  computed: {
    localTheme: {
      get() {
        return this.theme;
      },
      set(val) {
        this.$emit('update:theme', val);
      }
    }
  },
  methods: {
    getCurrentColor(colorObj) {
      return ThemeUtils.getCurrentColor(colorObj, this.editorState.colorMode);
    },
    getBackgroundPreviewStyle(target) {
      // Get background style for the preview
      const bgSettings = this.theme.backgrounds[target];
      const mode = this.editorState.colorMode;

      return getBackgroundStyle(bgSettings, mode);
    },
    updateBodyShape(shape) {
      const newTheme = {
        ...this.theme,
        backgrounds: {
          ...this.theme.backgrounds,
          body: {
            ...this.theme.backgrounds.body,
            shape: shape
          }
        }
      };
      this.$emit('update:theme', newTheme);
      this.$emit('open-background', 'body');
    }
  }
};
</script>

<style scoped>
/* Add these styles at the end of your <style> block */
.color-theme-preview {
  margin-top: 10px;
}

.theme-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.theme-row span {
  width: 80px;
  font-size: 14px;
}

.theme-colors {
  display: flex;
  flex: 1;
  gap: 4px;
}

.theme-color {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  border: 1px solid #ddd;
}
</style>