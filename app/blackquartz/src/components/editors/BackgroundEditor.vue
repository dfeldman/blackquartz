<template>
    <div class="background-editor-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Background Editor - {{ getBackgroundEditorTitle() }}</h3>
          <button class="close-btn" @click="$emit('close')">×</button>
        </div>
        
        <div class="modal-body">
          <!-- Background Type Selection -->
          <div class="background-type-selector">
            <input type="radio" id="bg-type-color" value="color" v-model="background.type">
            <label for="bg-type-color">Solid Color</label>
            
            <input type="radio" id="bg-type-gradient" value="gradient" v-model="background.type">
            <label for="bg-type-gradient">Gradient</label>
            
            <input type="radio" id="bg-type-pattern" value="pattern" v-model="background.type">
            <label for="bg-type-pattern">Pattern</label>
            
            <input type="radio" id="bg-type-texture" value="texture" v-model="background.type">
            <label for="bg-type-texture">Texture</label>
            
            <input type="radio" id="bg-type-image" value="image" v-model="background.type">
            <label for="bg-type-image">Image</label>
          </div>
          
          <!-- Background Preview -->
          <div class="background-preview" :style="getTempBackgroundStyle()">
            <div class="image-overlay" v-if="background.type === 'image' && background.overlay.enabled" 
                :style="{ backgroundColor: getCurrentColor(background.overlay.color), opacity: background.overlay.opacity }"></div>
          </div>
          
          <!-- Background Type-specific controls -->
          <div :class="['color-controls', background.type === 'color' ? 'active' : '']">
            <h4>Solid Color</h4>
            <div class="dual-color-input">
              <div class="dual-color-row">
                <label>Light Mode</label>
                <input type="color" v-model="background.color.light">
                <input type="text" v-model="background.color.light">
                <span class="link-both" :class="{ linked: colorLinked }" @click="toggleColorLink">
                  <i class="fas" :class="colorLinked ? 'fa-link' : 'fa-unlink'"></i>
                </span>
              </div>
              <div class="dual-color-row">
                <label>Dark Mode</label>
                <input type="color" v-model="background.color.dark" :disabled="colorLinked">
                <input type="text" v-model="background.color.dark" :disabled="colorLinked">
              </div>
            </div>
            
            <h4>Color Themes</h4>
            <div class="color-themes-grid">
              <div 
                v-for="theme in colorThemes" 
                :key="theme.name" 
                class="color-theme" 
                @click="applyColorTheme(theme, 'color')"
              >
                <div class="color-theme-preview">
                  <div v-for="color in theme.colors" :key="color" :style="{ backgroundColor: color }"></div>
                </div>
                <div class="color-theme-name">{{ theme.name }}</div>
              </div>
            </div>
          </div>
          
          <!-- Other type controls for gradient, pattern, texture, and image would go here -->
          <!-- For brevity, I'll include a placeholder for those -->
          <div :class="['gradient-controls', background.type === 'gradient' ? 'active' : '']">
            <!-- Gradient controls -->
          </div>
          
          <div :class="['pattern-controls', background.type === 'pattern' ? 'active' : '']">
            <!-- Pattern controls -->
          </div>
          
          <div :class="['texture-controls', background.type === 'texture' ? 'active' : '']">
            <!-- Texture controls -->
          </div>
          
          <div :class="['image-controls', background.type === 'image' ? 'active' : '']">
            <!-- Image controls -->
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn cancel" @click="$emit('close')">Cancel</button>
          <button class="btn save" @click="$emit('save', background)">Save Changes</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { CONSTANTS } from '../../constants';
  import ThemeUtils from '../../services/ThemeUtils';
  import {getBackgroundStyle} from '../../services/CSSStyleGenerator';
  
  export default {
    name: 'BackgroundEditor',
    props: {
      background: { type: Object, required: true },
      target: { type: String, required: true },
      colorMode: { type: String, default: 'light' }
    },
    emits: ['save', 'close'],
    data() {
      return {
        colorLinked: true,
        colorThemes: CONSTANTS.COLOR_THEMES,
        patterns: CONSTANTS.PATTERNS,
        textures: CONSTANTS.TEXTURES
      };
    },
    methods: {
      getBackgroundEditorTitle() {
        if (this.target === 'body') {
          return 'Body Background';
        } else if (this.target === 'page') {
          return 'Page Background';
        } else {
          return 'Hero Panel Background';
        }
      },
  
      getTempBackgroundStyle() {
        return getBackgroundStyle(this.background, this.colorMode);
      },
  
      getCurrentColor(colorObj) {
        return ThemeUtils.getCurrentColor(colorObj, this.colorMode);
      },
  
      applyColorTheme(theme, targetType) {
        const themeColors = this.colorMode === 'dark' ? theme.darks : theme.colors;
  
        if (targetType === 'color') {
          // Apply color theme to solid color
          this.background.color.light = themeColors[0];
          if (this.colorLinked) {
            this.background.color.dark = ThemeUtils.invertColor(themeColors[0]);
          } else {
            // Choose appropriate dark color from the theme
            this.background.color.dark = theme.darks[0];
          }
        }
        // Other theme applications would go here
      },
  
      toggleColorLink() {
        this.colorLinked = !this.colorLinked;
  
        if (this.colorLinked) {
          // Update dark mode colors based on light mode
          this.background.color.dark = ThemeUtils.invertColor(this.background.color.light);
        }
      },
      
      // Other methods would go here for pattern selection, gradient editing, etc.
    }
  };
  </script>
  