<template>
    <div>

<!-- Add this inside one of your control groups, e.g. after Typography or at the top level -->
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
editor <shape-editor 
:shape="theme.backgrounds.body.shape"
:color-mode="editorState.colorMode"
@update:shape="(shape) => {
  // Update the shape in the theme
  theme.backgrounds.body.shape = shape;
  $emit('open-background', 'body'); // Re-trigger background update
}"
></shape-editor>
      <!-- Background Settings -->
      <control-group 
        title="Background" 
        :collapsed="collapsedGroups.background" 
        @toggle="$emit('toggle-group', 'background')"
      >
        <button @click="$emit('open-background', 'body')" class="export-button" style="margin-bottom: 15px;">
          <i class="fas fa-edit"></i> Edit Body Background
        </button>
        
        <div class="background-preview" :style="getBackgroundPreviewStyle('body')">
          <div class="image-overlay" v-if="theme.backgrounds.body.type === 'image' && theme.backgrounds.body.overlay.enabled" 
              :style="{ backgroundColor: getCurrentColor(theme.backgrounds.body.overlay.color), opacity: theme.backgrounds.body.overlay.opacity }"></div>
        </div>
      </control-group>

      <!-- Page Settings -->
      <control-group 
        title="Page" 
        :collapsed="collapsedGroups.page" 
        @toggle="$emit('toggle-group', 'page')"
      >
      <font-input 
      v-model="theme.type.bodyFont"
      label="Body Font"
      size="regular"></font-input>



        <checkbox-input 
          label="Enable Page Background" 
          v-model="theme.page.enabled"
        ></checkbox-input>
        
        <div v-if="theme.page.enabled">
          <button @click="$emit('open-background', 'page')" class="export-button" style="margin: 15px 0;">
            <i class="fas fa-edit"></i> Edit Page Background
          </button>
          
          <div class="background-preview" :style="getBackgroundPreviewStyle('page')">
            <div class="image-overlay" v-if="theme.backgrounds.page.type === 'image' && theme.backgrounds.page.overlay.enabled" 
                :style="{ backgroundColor: getCurrentColor(theme.backgrounds.page.overlay.color), opacity: theme.backgrounds.page.overlay.opacity }"></div>
          </div>
          
          <slider-input 
            label="Shadow Size (px)" 
            v-model="theme.page.shadowSize" 
            :min="0" 
            :max="50"
            :unit="'px'"
          ></slider-input>
          
          <slider-input 
            label="Border Size (px)" 
            v-model="theme.page.borderSize" 
            :min="0" 
            :max="20"
            :unit="'px'"
          ></slider-input>
          
        <themed-color-input 
        label="Border Color" 
        v-model="theme.page.borderColor"
        :color-mode="editorState.colorMode"
        :theme="theme"
        ></themed-color-input>
          <label>Page Padding (px)</label>
          <div class="flex">
            <slider-input 
              label="Horizontal" 
              v-model="theme.page.paddingX" 
              :min="10" 
              :max="80"
              :unit="'px'"
            ></slider-input>
            
            <slider-input 
              label="Vertical" 
              v-model="theme.page.paddingY" 
              :min="10" 
              :max="80"
              :unit="'px'"
            ></slider-input>
          </div>
          
          <slider-input 
            label="Width (px)" 
            v-model="theme.page.maxWidth" 
            :min="600" 
            :max="1400"
            :step="50"
            :unit="'px'"
          ></slider-input>
          
          <slider-input 
            label="Border Radius (px)" 
            v-model="theme.page.borderRadius" 
            :min="0" 
            :max="30"
            :unit="'px'"
          ></slider-input>
        </div>
      </control-group>
      
      <!-- Hero Panel -->
      <control-group 
        title="Hero Panel" 
        :collapsed="collapsedGroups.hero" 
        @toggle="$emit('toggle-group', 'hero')"
      >
        <checkbox-input 
          label="Enable Hero Panel" 
          v-model="theme.hero.enabled"
        ></checkbox-input>
        
        <div v-if="theme.hero.enabled">
          <button @click="$emit('open-background', 'hero')" class="export-button" style="margin: 15px 0;">
            <i class="fas fa-edit"></i> Edit Hero Background
          </button>
          
          <div class="background-preview" :style="getBackgroundPreviewStyle('hero')">
            <div class="image-overlay" v-if="theme.backgrounds.hero.type === 'image' && theme.backgrounds.hero.overlay.enabled" 
                :style="{ backgroundColor: getCurrentColor(theme.backgrounds.hero.overlay.color), opacity: theme.backgrounds.hero.overlay.opacity }"></div>
          </div>
          
          <label>Padding (px)</label>
          <div class="flex">
            <slider-input 
              label="Horizontal" 
              v-model="theme.hero.paddingX" 
              :min="20" 
              :max="100"
              :unit="'px'"
            ></slider-input>
            
            <slider-input 
              label="Vertical" 
              v-model="theme.hero.paddingY" 
              :min="20" 
              :max="100"
              :unit="'px'"
            ></slider-input>
          </div>
          
          <slider-input 
            label="Border Radius (px)" 
            v-model="theme.hero.borderRadius" 
            :min="0" 
            :max="30"
            :unit="'px'"
          ></slider-input>
          
          <div>
            <label>Title Text Effect</label>
            <select v-model="theme.hero.titleEffect">
              <option value="none">None</option>
              <option value="shadow">Text Shadow</option>
              <option value="glow">Glowing</option>
              <option value="outline">Outline</option>
              <option value="contrast">High Contrast</option>
            </select>
          </div>
        </div>
      </control-group>
      
      <!-- Image Settings (simplified) -->
      <control-group 
        title="Images" 
        :collapsed="collapsedGroups.images" 
        @toggle="$emit('toggle-group', 'images')"
      >
        <h4>General Image Settings</h4>
        
        <slider-input 
          label="Image Max Width (%)" 
          v-model="theme.images.maxWidth" 
          :min="50" 
          :max="100" 
          :step="5"
          :unit="'%'"
        ></slider-input>
        
        <label>Default Alignment</label>
        <select v-model="theme.images.defaultAlign">
          <option value="center">Center</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
        
        <!-- More image settings would go here -->
      </control-group>
    </div>
  </template>
  
  <script>
  import ControlGroup from './controls/ControlGroup.vue';
  import SliderInput from './controls/SliderInput.vue';
  import CheckboxInput from './controls/CheckboxInput.vue';
  import ThemedColorInput from './controls/ThemedColorInput.vue';
  import SegmentedControl from './controls/SegmentedControl.vue';
  import { getBackgroundStyle } from '../services/CSSStyleGenerator';
  import ThemeUtils from '../services/ThemeUtils';
  import FontInput from './controls/FontInput.vue';
  import ShapeEditor from './editors/ShapeEditor.vue';
  export default {
    name: 'DesignControls',
    components: {
      ControlGroup,
      SliderInput,
      CheckboxInput,
      ThemedColorInput,
        FontInput,
        ShapeEditor
    },
    props: {
      theme: { type: Object, required: true },
      editorState: { type: Object, required: true },
      collapsedGroups: { type: Object, required: true }
    },
    emits: ['toggle-group', 'open-background', 'open-font', 'open-color', 'open-color-theme'],
    methods: {
      getCurrentColor(colorObj) {
        return ThemeUtils.getCurrentColor(colorObj, this.editorState.colorMode);
      },
      getBackgroundPreviewStyle(target) {
        // Get background style for the preview
        const bgSettings = this.theme.backgrounds[target];
        const mode = this.editorState.colorMode;
  
        return getBackgroundStyle(bgSettings, mode);
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