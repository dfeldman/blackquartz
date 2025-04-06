<template>
    <div class="background-editor-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Color Picker - {{ getColorPickerTitle() }}</h3>
          <button class="close-btn" @click="$emit('close')">×</button>
        </div>
        
        <div class="modal-body">
          <div class="dual-color-input">
            <div class="dual-color-row">
              <label>Light Mode</label>
              <input type="color" v-model="dualColor.light" @input="updateColor">
              <input type="text" v-model="dualColor.light" @input="updateColor">
              <span class="link-both" :class="{ linked: colorLinked }" @click="toggleColorLink">
                <i class="fas" :class="colorLinked ? 'fa-link' : 'fa-unlink'"></i>
              </span>
            </div>
            <div class="dual-color-row">
              <label>Dark Mode</label>
              <input type="color" v-model="dualColor.dark" :disabled="colorLinked" @input="updateColor">
              <input type="text" v-model="dualColor.dark" :disabled="colorLinked" @input="updateColor">
            </div>
          </div>
          
          <h4>Color Themes</h4>
          <div class="color-themes-grid">
            <div 
              v-for="theme in colorThemes" 
              :key="theme.name" 
              class="color-theme" 
              @click="applyColorTheme(theme)"
            >
              <div class="color-theme-preview">
                <div v-for="color in theme.colors" :key="color" :style="{ backgroundColor: color }"></div>
              </div>
              <div class="color-theme-name">{{ theme.name }}</div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn cancel" @click="$emit('close')">Cancel</button>
          <button class="btn save" @click="$emit('save', dualColor)">Apply Color</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { CONSTANTS } from '../../constants';
  import ThemeUtils from '../../services/ThemeUtils';
  
  export default {
    name: 'ColorPicker',
    props: {
      color: { required: true },
      target: { type: String, required: true },
      mode: { type: String, default: 'light' }
    },
    emits: ['save', 'close', 'set-color'],
    data() {
      return {
        dualColor: this.initDualColor(),
        colorLinked: true,
        colorThemes: CONSTANTS.COLOR_THEMES
      };
    },
    methods: {
      initDualColor() {
        // Convert to dual color format if needed
        if (typeof this.color === 'string') {
          return {
            light: this.color,
            dark: ThemeUtils.invertColor(this.color)
          };
        } else if (this.color && typeof this.color === 'object') {
          return {
            light: this.color.light || '#000000',
            dark: this.color.dark || '#ffffff'
          };
        }
        return { light: '#000000', dark: '#ffffff' };
      },
  
      updateColor() {
        // If colors are linked, update dark color based on light
        if (this.colorLinked) {
          this.dualColor.dark = ThemeUtils.invertColor(this.dualColor.light);
        }
  
        // Emit the updated dual color
        this.$emit('set-color', this.dualColor);
      },
  
      toggleColorLink() {
        this.colorLinked = !this.colorLinked;
        if (this.colorLinked) {
          this.dualColor.dark = ThemeUtils.invertColor(this.dualColor.light);
          this.updateColor();
        }
      },
  
      getColorPickerTitle() {
        if (this.target === 'text') {
          return 'Text Color';
        } else if (this.target === 'title') {
          return 'Title Color';
        } else if (this.target === 'heading') {
          return 'Heading Color';
        } else if (this.target === 'page-border') {
          return 'Page Border Color';
        }
        return 'Color';
      },
  
      applyColorTheme(theme) {
        // Apply color from theme
        const colors = this.mode === 'dark' ? theme.darks : theme.colors;
        this.dualColor.light = colors[0];
  
        if (this.colorLinked) {
          this.dualColor.dark = ThemeUtils.invertColor(colors[0]);
        } else {
          this.dualColor.dark = theme.darks[0];
        }
  
        this.updateColor();
      }
    }
  };
  </script>