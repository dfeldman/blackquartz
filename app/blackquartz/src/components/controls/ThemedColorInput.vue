<template>
    <div class="themed-color-input" ref="colorInputContainer">
      <!-- Color Preview Button -->
      <div 
        class="color-preview-container" 
        :class="{ 'large': size === 'large' }"
        @click="openPanel"
        ref="colorPreview"
      >
        <div class="color-preview">
          <div class="color-preview-light" :style="{ backgroundColor: previewLightColor }">
            <span class="mode-indicator">☀️</span>
          </div>
          <div class="color-preview-dark" :style="{ backgroundColor: previewDarkColor }">
            <span class="mode-indicator">🌙</span>
          </div>
        </div>
        <div v-if="label" class="color-preview-label">{{ label }}</div>
      </div>
      
      <!-- Color Panel Popup -->
      <div 
        v-if="panelOpen" 
        class="color-panel-popup" 
        :style="popupStyle"
        ref="colorPanel"
      >
        <div class="panel-header">
          <h3>{{ label || 'Select Colors' }}</h3>
          <button class="close-btn" @click="cancelSelection">×</button>
        </div>
        
        <div class="panel-body">
          <!-- Light Mode Section -->
          <div class="mode-section">
            <h4><span class="mode-icon">☀️</span> Light Mode</h4>
            
            <div class="custom-color-section">
              <div class="color-input-row">
                <div class="color-input-container">
                  <input 
                    type="color" 
                    v-model="tempColors.light" 
                    @input="updateTempColors"
                    class="custom-color-input"
                  >
                  <div class="custom-color-preview" :style="{ backgroundColor: tempColors.light }"></div>
                </div>
                <input 
                  type="text" 
                  v-model="tempColors.light" 
                  @input="updateTempColors"
                  class="hex-input"
                  maxlength="7"
                  placeholder="#RRGGBB"
                >
                <div class="quick-colors">
                  <button class="quick-color white" @click="setQuickColor('light', '#FFFFFF')"></button>
                  <button class="quick-color black" @click="setQuickColor('light', '#000000')"></button>
                </div>
                
                <button 
                  class="link-colors-btn" 
                  :class="{ 'linked': colorLinked }" 
                  @click="toggleColorLink" 
                  title="Automatically generate dark mode color"
                >
                  <span class="link-icon">🔗</span>
                </button>
              </div>
            </div>
            
            <!-- Theme Colors Light -->
            <div class="theme-colors-section">
              <h5>Theme Colors</h5>
              <div class="theme-colors-grid">
                <button 
                  v-for="(color, index) in themeColors.light" 
                  :key="`light-${index}`"
                  class="theme-color-btn" 
                  :class="{ 'selected': selectedThemeIndex.light === index + 1 }"
                  :style="{ backgroundColor: color }"
                  @click="selectThemeColor('light', index + 1, color)"
                  :title="colorNames[index]"
                ></button>
              </div>
            </div>
          </div>
          
          <!-- Dark Mode Section -->
          <div class="mode-section">
            <h4><span class="mode-icon">🌙</span> Dark Mode</h4>
            
            <div class="custom-color-section">
              <div class="color-input-row">
                <div class="color-input-container">
                  <input 
                    type="color" 
                    v-model="tempColors.dark" 
                    @input="updateTempColors"
                    class="custom-color-input"
                    :disabled="colorLinked"
                  >
                  <div class="custom-color-preview" :style="{ backgroundColor: tempColors.dark }"></div>
                </div>
                <input 
                  type="text" 
                  v-model="tempColors.dark" 
                  @input="updateTempColors"
                  class="hex-input"
                  maxlength="7"
                  placeholder="#RRGGBB"
                  :disabled="colorLinked"
                >
                <div class="quick-colors">
                  <button class="quick-color white" @click="setQuickColor('dark', '#FFFFFF')" :disabled="colorLinked"></button>
                  <button class="quick-color black" @click="setQuickColor('dark', '#000000')" :disabled="colorLinked"></button>
                </div>
              </div>
            </div>
            
            <!-- Theme Colors Dark -->
            <div class="theme-colors-section">
              <h5>Theme Colors</h5>
              <div class="theme-colors-grid">
                <button 
                  v-for="(color, index) in themeColors.dark" 
                  :key="`dark-${index}`"
                  class="theme-color-btn"
                  :class="{ 'selected': selectedThemeIndex.dark === index + 1 }"
                  :style="{ backgroundColor: color }"
                  @click="selectThemeColor('dark', index + 1, color)"
                  :title="colorNames[index]"
                  :disabled="colorLinked"
                ></button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="panel-footer">
          <button class="btn cancel" @click="cancelSelection">Cancel</button>
          <button class="btn apply" @click="applySelection">Apply</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import ThemeUtils from '../../services/ThemeUtils';
  
  export default {
    name: 'ThemedColorInput',
    props: {
      modelValue: { required: true },
      label: String,
      colorMode: { type: String, default: 'light' },
      theme: { type: Object, required: true },
      size: { type: String, default: 'regular' } // 'regular' or 'large'
    },
    emits: ['update:modelValue'],
    data() {
      return {
        panelOpen: false,
        colorLinked: true,
        tempColors: { light: '#000000', dark: '#FFFFFF' },
        originalColors: { light: '#000000', dark: '#FFFFFF' },
        selectedThemeIndex: { light: null, dark: null },
        originalThemeIndex: { light: null, dark: null },
        popupStyle: {
          top: '0px',
          left: '0px'
        },
        popupPosition: 'bottom', // 'bottom' or 'top'
        colorNames: [
          'Text Color',
          'Heading Color',
          'Page Background',
          'Body Background 1',
          'Body Background 2',
          'Highlight Background 1',
          'Highlight Background 2',
          'Large Border',
          'Small Border'
        ]
      };
    },
    computed: {
      // Get current theme colors
      themeColors() {
        if (this.theme && this.theme.colorTheme) {
          return {
            light: [...this.theme.colorTheme.light] || Array(9).fill('#FFFFFF'),
            dark: [...this.theme.colorTheme.dark] || Array(9).fill('#000000')
          };
        }
        return {
          light: Array(9).fill('#FFFFFF'),
          dark: Array(9).fill('#000000')
        };
      },
      
      // Calculate preview colors
      previewLightColor() {
        if (this.selectedThemeIndex.light) {
          return this.themeColors.light[this.selectedThemeIndex.light - 1];
        }
        return this.isColorObject(this.modelValue) ? this.modelValue.light : this.modelValue;
      },
      
      previewDarkColor() {
        if (this.selectedThemeIndex.dark) {
          return this.themeColors.dark[this.selectedThemeIndex.dark - 1];
        }
        return this.isColorObject(this.modelValue) ? this.modelValue.dark : ThemeUtils.invertColor(this.modelValue);
      }
    },
    watch: {
      modelValue: {
        handler(newValue) {
          this.initFromModelValue();
        },
        immediate: true,
        deep: true
      }
    },
    mounted() {
      // Add click outside listener to close the panel
      document.addEventListener('mousedown', this.handleClickOutside);
      
      // Add resize listener to reposition panel if window size changes
      window.addEventListener('resize', this.handleResize);
      
      // Add scroll listener for all parent elements
      this.addScrollListeners();
    },
    beforeUnmount() {
      // Remove event listeners
      document.removeEventListener('mousedown', this.handleClickOutside);
      window.removeEventListener('resize', this.handleResize);
      this.removeScrollListeners();
    },
    methods: {
      // Check if a value is a color object with light/dark properties
      isColorObject(value) {
        return value && typeof value === 'object' && 'light' in value && 'dark' in value;
      },
      
      // Initialize component data from model value
      initFromModelValue() {
        if (typeof this.modelValue === 'number') {
          // It's a theme index
          const index = this.modelValue;
          this.selectedThemeIndex.light = index;
          this.selectedThemeIndex.dark = index;
          this.originalThemeIndex = { ...this.selectedThemeIndex };
          
          this.tempColors = {
            light: this.themeColors.light[index - 1] || '#000000',
            dark: this.themeColors.dark[index - 1] || '#FFFFFF'
          };
        } else if (this.isColorObject(this.modelValue)) {
          // It's a color object with light/dark properties
          this.tempColors = {
            light: this.modelValue.light || '#000000',
            dark: this.modelValue.dark || '#FFFFFF'
          };
          this.selectedThemeIndex = { light: null, dark: null };
          this.originalThemeIndex = { light: null, dark: null };
        } else {
          // It's a single color value
          this.tempColors = {
            light: this.modelValue || '#000000',
            dark: ThemeUtils.invertColor(this.modelValue || '#000000')
          };
          this.selectedThemeIndex = { light: null, dark: null };
          this.originalThemeIndex = { light: null, dark: null };
        }
        
        this.originalColors = { ...this.tempColors };
      },
      
      // Open the color selection panel and position it
      openPanel() {
        this.initFromModelValue();
        this.calculatePopupPosition();
        this.panelOpen = true;
        
        // Add a small delay to ensure the panel is rendered before positioning
        this.$nextTick(() => {
          this.calculatePopupPosition();
        });
      },
      
      // Calculate and set the popup position based on the trigger element
      calculatePopupPosition() {
        const triggerEl = this.$refs.colorPreview;
        if (!triggerEl) return;
        
        const triggerRect = triggerEl.getBoundingClientRect();
        const panelWidth = 350; // Fixed panel width
        const panelHeight = 480; // Estimated panel height
        
        // Check if there's enough space below
        const spaceBelow = window.innerHeight - triggerRect.bottom;
        const shouldPositionAbove = spaceBelow < panelHeight && triggerRect.top > panelHeight;
        
        // Position relative to the button, adding a small offset
        const offsetX = 0; // No horizontal offset
        const offsetY = 5; // 5px gap between button and popup
        
        if (shouldPositionAbove) {
          // Position above the trigger element
          this.popupStyle = {
            bottom: `${window.innerHeight - triggerRect.top + offsetY}px`,
            left: `${triggerRect.left}px`,
            top: 'auto'
          };
          this.popupPosition = 'top';
        } else {
          // Position below the trigger element
          this.popupStyle = {
            top: `${triggerRect.bottom + offsetY}px`,
            left: `${triggerRect.left}px`,
            bottom: 'auto'
          };
          this.popupPosition = 'bottom';
        }
        
        // After setting initial position, check if it goes off-screen horizontally
        this.$nextTick(() => {
          const panel = this.$refs.colorPanel;
          if (panel) {
            const panelRect = panel.getBoundingClientRect();
            
            // If panel extends beyond right edge of screen, adjust left position
            if (panelRect.right > window.innerWidth - 10) {
              const newLeft = Math.max(10, window.innerWidth - panelRect.width - 10);
              this.popupStyle.left = `${newLeft}px`;
            }
          }
        });
      },
      
      // Handle window resize
      handleResize() {
        if (this.panelOpen) {
          this.calculatePopupPosition();
        }
      },
      
      // Add scroll listeners to parent elements
      addScrollListeners() {
        let parent = this.$el.parentElement;
        while (parent) {
          parent.addEventListener('scroll', this.handleScroll);
          parent = parent.parentElement;
        }
      },
      
      // Remove scroll listeners
      removeScrollListeners() {
        let parent = this.$el && this.$el.parentElement;
        while (parent) {
          parent.removeEventListener('scroll', this.handleScroll);
          parent = parent.parentElement;
        }
      },
      
      // Handle scroll events in parent elements
      handleScroll() {
        if (this.panelOpen) {
          this.calculatePopupPosition();
        }
      },
      
      // Handle clicks outside the component to close the panel
      handleClickOutside(event) {
        const colorPanel = this.$refs.colorPanel;
        const colorPreview = this.$refs.colorPreview;
        
        if (this.panelOpen && colorPanel && colorPreview) {
          if (!colorPanel.contains(event.target) && !colorPreview.contains(event.target)) {
            this.cancelSelection();
          }
        }
      },
      
      // Update temp colors when inputs change
      updateTempColors() {
        // If colors are linked, automatically generate dark color
        if (this.colorLinked) {
          this.tempColors.dark = ThemeUtils.invertColor(this.tempColors.light);
        }
        
        // When custom colors are used, reset any theme index selection
        this.selectedThemeIndex = { light: null, dark: null };
      },
      
      // Set quick color (white or black)
      setQuickColor(mode, color) {
        this.tempColors[mode] = color;
        
        if (mode === 'light' && this.colorLinked) {
          this.tempColors.dark = ThemeUtils.invertColor(color);
        }
        
        // Reset theme index selection for this mode
        this.selectedThemeIndex[mode] = null;
      },
      
      // Toggle the color link
      toggleColorLink() {
        this.colorLinked = !this.colorLinked;
        
        if (this.colorLinked) {
          // Generate dark color based on current light color
          this.tempColors.dark = ThemeUtils.invertColor(this.tempColors.light);
          
          // If light mode uses a theme color, apply the same index to dark mode
          if (this.selectedThemeIndex.light) {
            this.selectedThemeIndex.dark = this.selectedThemeIndex.light;
          }
        }
      },
      
      // Select a theme color
      selectThemeColor(mode, index, color) {
        this.selectedThemeIndex[mode] = index;
        this.tempColors[mode] = color;
        
        // If colors are linked, update the other mode too
        if (this.colorLinked && mode === 'light') {
          this.selectedThemeIndex.dark = index;
          this.tempColors.dark = this.themeColors.dark[index - 1];
        }
      },
      
      // Apply the selection
      applySelection() {
        let result;
        
        // If a theme color is selected for light mode
        if (this.selectedThemeIndex.light) {
          // Just emit the theme index (1-9)
          result = this.selectedThemeIndex.light;
        } else {
          // Emit a color object with light/dark colors
          result = {
            light: this.tempColors.light,
            dark: this.tempColors.dark
          };
        }
        
        this.$emit('update:modelValue', result);
        this.panelOpen = false;
      },
      
      // Cancel and close the panel
      cancelSelection() {
        this.tempColors = { ...this.originalColors };
        this.selectedThemeIndex = { ...this.originalThemeIndex };
        this.panelOpen = false;
      }
    }
  };
  </script>
  
  <style scoped>
  .themed-color-input {
    position: relative;
    margin-bottom: 10px;
  }
  
  /* Color Preview */
  .color-preview-container {
    display: flex;
    align-items: center;
    padding: 5px;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    background-color: #f5f5f5;
    transition: border-color 0.2s;
    max-width: fit-content;
  }
  
  .color-preview-container:hover {
    border-color: #aaa;
  }
  
  /* Large size variant */
  .color-preview-container.large {
    padding: 8px;
  }
  
  .color-preview-container.large .color-preview {
    width: 90px;
    height: 45px;
  }
  
  .color-preview-container.large .color-preview-label {
    font-size: 16px;
  }
  
  .color-preview {
    display: flex;
    width: 60px;
    height: 30px;
    border-radius: 3px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .color-preview-light, 
  .color-preview-dark {
    width: 50%;
    height: 100%;
    position: relative;
  }
  
  .mode-indicator {
    position: absolute;
    font-size: 10px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0.6;
  }
  
  .color-preview-label {
    margin-left: 10px;
    font-size: 14px;
    color: #555;
  }
  
  /* Color Panel Popup */
  .color-panel-popup {
    position: fixed; /* Using fixed position for more reliable positioning */
    width: 350px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    border: 1px solid #ddd;
    max-height: 80vh;
    overflow: hidden;
  }
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 15px;
    border-bottom: 1px solid #eee;
    background-color: #f9f9f9;
  }
  
  .panel-header h3 {
    margin: 0;
    font-size: 16px;
    color: #333;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #666;
    line-height: 1;
  }
  
  .panel-body {
    padding: 12px;
    overflow-y: auto;
    max-height: 60vh;
  }
  
  .panel-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 15px;
    border-top: 1px solid #eee;
    background-color: #f9f9f9;
  }
  
  /* Mode Sections */
  .mode-section {
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
  }
  
  .mode-section:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
  
  .mode-section h4 {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #444;
    display: flex;
    align-items: center;
  }
  
  .mode-icon {
    margin-right: 5px;
    font-size: 12px;
  }
  
  /* Custom Color Section */
  .custom-color-section {
    margin-bottom: 12px;
  }
  
  .color-input-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .color-input-container {
    position: relative;
    width: 36px;
    height: 36px;
  }
  
  .custom-color-input {
    position: absolute;
    top: 0;
    left: 0;
    width: 36px;
    height: 36px;
    opacity: 0;
    cursor: pointer;
  }
  
  .custom-color-preview {
    width: 100%;
    height: 100%;
    border-radius: 4px;
    border: 1px solid #ddd;
  }
  
  .hex-input {
    flex: 1;
    padding: 6px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: monospace;
    font-size: 13px;
  }
  
  .quick-colors {
    display: flex;
    gap: 4px;
  }
  
  .quick-color {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1px solid #ddd;
    cursor: pointer;
  }
  
  .quick-color.white {
    background-color: #FFFFFF;
  }
  
  .quick-color.black {
    background-color: #000000;
  }
  
  .quick-color:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* Link Button */
  .link-colors-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1px solid #ddd;
    background-color: #f5f5f5;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .link-colors-btn:hover {
    background-color: #e8e8e8;
  }
  
  .link-colors-btn.linked {
    background-color: #e0f0ff;
    border-color: #a0d0ff;
  }
  
  .link-icon {
    font-size: 12px;
  }
  
  /* Theme Colors */
  .theme-colors-section {
    margin-top: 10px;
  }
  
  .theme-colors-section h5 {
    margin: 0 0 8px 0;
    font-size: 13px;
    color: #666;
  }
  
  .theme-colors-grid {
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    gap: 6px;
  }
  
  .theme-color-btn {
    aspect-ratio: 1/1;
    border-radius: 4px;
    border: 1px solid #ddd;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .theme-color-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    z-index: 1;
  }
  
  .theme-color-btn.selected {
    transform: scale(1.1);
    box-shadow: 0 0 0 2px #4a8bf5;
    z-index: 2;
  }
  
  .theme-color-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  /* Buttons */
  .btn {
    padding: 6px 12px;
    border-radius: 4px;
    border: none;
    font-size: 13px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .btn.cancel {
    background-color: #f0f0f0;
    color: #333;
  }
  
  .btn.cancel:hover {
    background-color: #e0e0e0;
  }
  
  .btn.apply {
    background-color: #4a8bf5;
    color: white;
  }
  
  .btn.apply:hover {
    background-color: #3a7ce5;
  }
  </style>