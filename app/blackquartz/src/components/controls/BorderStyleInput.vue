<template>
    <div class="border-style-input" ref="borderStyleInputContainer">
      <!-- Border Style Preview Button -->
      <div 
        class="border-preview-container" 
        :class="{ 'large': size === 'large' }"
        @click="openPanel"
        ref="borderPreview"
      >
        <div class="border-preview">
          <div 
            class="border-sample" 
            :class="'sample-' + borderConfig.styleName.toLowerCase().replace(/\s+/g, '-')"
            ref="previewSample"
          ></div>
        </div>
        <div class="border-details">
          <div class="border-name">{{ label || 'Border Style' }}</div>
          <div class="border-info">{{ borderConfig.styleName }} · {{ borderConfig.params.width || 2 }}px</div>
        </div>
      </div>
      
      <!-- Border Style Panel using InputDetailComponent -->
      <InputDetailComponent
        v-if="tempConfig"
        :visible="panelOpen"
        :title="label || 'Border Style Editor'"
        :display-mode="displayMode"
        :target-element="$refs.borderPreview"
        :position="panelPosition"
        :size="panelSize"
        @update:size="panelSize = $event"
        @close="cancelSelection"
        @apply="applySelection"
        @cancel="cancelSelection"
        @update:display-mode="updateDisplayMode"
        @update:position="updatePanelPosition"
      >
        <!-- Border Style Configuration Panel Content -->
        <div class="border-panel-content">
          <!-- Live Preview Area -->
          <div class="border-preview-area">
            <h4>Live Preview</h4>
            <div class="preview-container">
              <!-- Live preview renders the actual HTML and CSS -->
              <div class="preview-wrapper" ref="previewWrapper"></div>
            </div>
          </div>
          
          <!-- Style Gallery -->
          <div class="style-gallery">
            <h4>Style Gallery</h4>
            <div class="style-grid">
              <div 
                v-for="style in BORDER_STYLES" 
                :key="style.name"
                class="style-item" 
                :class="{ 'selected': tempConfig.styleName === style.name }"
                @click="selectStyle(style)"
              >
                <div class="style-preview-container">
                  <!-- Gallery item previews -->
                  <div class="gallery-preview-wrapper" :id="'gallery-' + style.name.toLowerCase().replace(/\s+/g, '-')"></div>
                </div>
                <div class="style-name">{{ style.name }}</div>
              </div>
            </div>
          </div>
          
          <!-- Basic Parameters -->
          <div class="basic-controls" v-if="commonParams.length > 0">
            <h4>Basic Settings</h4>
            
            <!-- Common Parameters (width, radius) -->
            <div 
              v-for="param in commonParams" 
              :key="param.name"
              class="control-group"
            >
              <label>{{ formatParamName(param.name) }}</label>
              <div class="slider-container">
                <input 
                  type="range" 
                  v-model.number="tempConfig.params[param.name]" 
                  :min="param.min" 
                  :max="param.max" 
                  :step="param.step || 1"
                  class="slider"
                >
                <div class="input-with-unit">
                  <input 
                    type="number" 
                    v-model.number="tempConfig.params[param.name]" 
                    :min="param.min" 
                    :max="param.max"
                    class="number-input"
                  >
                  <span class="unit">{{ param.unit }}</span>
                </div>
              </div>
            </div>
            
            <!-- Border Style Selector (if applicable) -->
            <div class="control-group" v-if="hasStyleParam">
              <label>Border Style</label>
              <select 
                v-model="tempConfig.params.style"
                class="select-input"
              >
                <option 
                  v-for="option in borderStyleOptions" 
                  :key="option"
                  :value="option"
                >
                  {{ formatParamName(option) }}
                </option>
              </select>
            </div>
          </div>
          
          <!-- Color Parameters -->
          <div class="color-controls" v-if="colorParams.length > 0">
            <h4>Colors</h4>
            
            <div 
              v-for="param in colorParams" 
              :key="param.name"
              class="control-group"
            >
              <themed-color-input 
                :label="formatParamName(param.name)"
                v-model="tempConfig.params[param.name]"
                :color-mode="editorState.colorMode"
                :theme="theme"
              ></themed-color-input>
            </div>
          </div>
          
          <!-- Additional Style-specific Parameters -->
          <div class="advanced-options" v-if="styleSpecificParams.length > 0">
            <h4>Style Options</h4>
            
            <!-- Style-specific numeric parameters -->
            <div 
              v-for="param in styleSpecificParams" 
              :key="param.name"
              class="control-group"
            >
              <label>{{ formatParamName(param.name) }}</label>
              <div class="slider-container">
                <input 
                  type="range" 
                  v-model.number="tempConfig.params[param.name]" 
                  :min="param.min" 
                  :max="param.max" 
                  :step="param.step || 1"
                  class="slider"
                >
                <div class="input-with-unit">
                  <input 
                    type="number" 
                    v-model.number="tempConfig.params[param.name]" 
                    :min="param.min" 
                    :max="param.max"
                    class="number-input"
                  >
                  <span class="unit">{{ param.unit }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Boolean Parameters -->
          <div class="boolean-options" v-if="booleanParams.length > 0">
            <h4>Options</h4>
            
            <div 
              v-for="param in booleanParams" 
              :key="param.name"
              class="control-group checkbox-group"
            >
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="tempConfig.params[param.name]"
                  class="checkbox-input"
                >
                {{ formatParamName(param.name) }}
              </label>
            </div>
          </div>
          
          <!-- Select Parameters -->
          <div class="select-options" v-if="selectParams.length > 0">
            <h4>Select Options</h4>
            
            <div 
              v-for="param in selectParams" 
              :key="param.name"
              class="control-group"
            >
              <label>{{ formatParamName(param.name) }}</label>
              <select 
                v-model="tempConfig.params[param.name]"
                class="select-input"
              >
                <option 
                  v-for="option in param.options" 
                  :key="option"
                  :value="option"
                >
                  {{ formatParamName(option) }}
                </option>
              </select>
            </div>
          </div>
          
          <!-- Text Parameters -->
          <div class="text-options" v-if="textParams.length > 0">
            <h4>Text Options</h4>
            
            <div 
              v-for="param in textParams" 
              :key="param.name"
              class="control-group"
            >
              <label>{{ formatParamName(param.name) }}</label>
              <input 
                type="text" 
                v-model="tempConfig.params[param.name]"
                class="text-input"
              >
            </div>
          </div>
        </div>
      </InputDetailComponent>
    </div>
  </template>
  
  <script>
  import { reactive, nextTick } from 'vue';
  import InputDetailComponent from './InputDetailComponent.vue';
  import ThemedColorInput from './ThemedColorInput.vue';
  import BORDER_STYLES from '../../constants/BorderStyles.js';
  import ThemeUtils from '../../services/ThemeUtils.js';
  
  export default {
    name: 'BorderStyleInput',
    components: {
      InputDetailComponent,
      ThemedColorInput
    },
    props: {
      modelValue: { required: true },
      label: String,
      size: { type: String, default: 'regular' }, // 'regular' or 'large'
      defaultDisplayMode: { type: String, default: 'popup' }, // 'popup', 'modal', 'tearoff', 'panel'
      theme: { type: Object, required: true },
      editorState: { type: Object, required: true }
    },
    emits: ['update:modelValue'],
    data() {
      return {
        panelOpen: false,
        displayMode: this.defaultDisplayMode,
        panelPosition: { top: '0px', left: '0px' },
        panelSize: { width: '650px', height: '700px' },
        BORDER_STYLES, // Make the array available to the template
        
        // Temporary configuration during editing
        tempConfig: null, // Will be initialized in mounted
        
        // Original configuration before editing
        originalConfig: null,
        
        // Define common parameters that appear for all styles
        commonParamNames: ['width', 'radius'],
        
        // Border style options for select
        borderStyleOptions: ['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'],
        
        // Style elements and IDs for render management
        styleElements: {
          livePreview: null,
          galleryPreviews: {}
        }
      };
    },
    computed: {
      // Parse the border style configuration from the model value
      borderConfig() {
        if (typeof this.modelValue === 'object' && this.modelValue.styleName) {
          return {
            styleName: this.modelValue.styleName,
            params: { ...this.modelValue.params } // Clone to avoid mutation
          };
        }
        
        // Default to the first style if no valid configuration
        const defaultStyle = BORDER_STYLES[0];
        return {
          styleName: defaultStyle.name,
          params: this.getDefaultParams(defaultStyle.name)
        };
      },
      
      // Get the selected style object
      selectedStyle() {
        if (!this.tempConfig) {
          // Fallback to first style if tempConfig not initialized
          return BORDER_STYLES[0];
        }
        
        return BORDER_STYLES.find(style => style.name === this.tempConfig.styleName) || BORDER_STYLES[0];
      },
      
      // Get common parameters for the UI
      commonParams() {
        if (!this.selectedStyle) return [];
        
        return this.selectedStyle.numericParams?.filter(param => 
          this.commonParamNames.includes(param.name)
        ) || [];
      },
      
      // Get style-specific numeric parameters for the UI
      styleSpecificParams() {
        if (!this.selectedStyle) return [];
        
        return this.selectedStyle.numericParams?.filter(param => 
          !this.commonParamNames.includes(param.name)
        ) || [];
      },
      
      // Get color parameters for the UI
      colorParams() {
        if (!this.selectedStyle || !this.selectedStyle.colorParams) return [];
        
        return this.selectedStyle.colorParams;
      },
      
      // Get boolean parameters for the UI
      booleanParams() {
        if (!this.selectedStyle || !this.selectedStyle.booleanParams) return [];
        
        return this.selectedStyle.booleanParams;
      },
      
      // Get select parameters for the UI
      selectParams() {
        if (!this.selectedStyle || !this.selectedStyle.selectParams) return [];
        
        return this.selectedStyle.selectParams;
      },
      
      // Get text parameters for the UI
      textParams() {
        if (!this.selectedStyle || !this.selectedStyle.textParams) return [];
        
        return this.selectedStyle.textParams;
      },
      
      // Check if this style has a style parameter
      hasStyleParam() {
        if (!this.selectedStyle || !this.selectedStyle.selectParams) return false;
        
        return this.selectedStyle.selectParams.some(param => param.name === 'style');
      }
    },
    watch: {
      modelValue: {
        handler() {
          if (this.tempConfig) {
            this.initFromModelValue();
          }
          this.updatePreviewSample();
        },
        deep: true
      },
      
      // Update preview when editor state changes
      'editorState.colorMode'() {
        this.updatePreviewSample();
        if (this.panelOpen) {
          this.updateLivePreview();
          this.updateGalleryPreviews();
        }
      },
      
      // Update when style changes
      'tempConfig.styleName'() {
        this.$nextTick(() => {
          this.updateLivePreview();
        });
      },
      
      // Update when parameters change
      'tempConfig.params': {
        handler() {
          this.$nextTick(() => {
            this.updateLivePreview();
          });
        },
        deep: true
      },
      
      // Update panel open state
      panelOpen(isOpen) {
        if (isOpen) {
          this.$nextTick(() => {
            this.renderGalleryPreviews();
            this.updateLivePreview();
          });
        }
      }
    },
    mounted() {
      // Initialize tempConfig with default parameters
      const defaultStyle = BORDER_STYLES[0];
      this.tempConfig = reactive({
        styleName: defaultStyle.name,
        params: this.getDefaultParams(defaultStyle.name)
      });
      
      // Initialize from model value
      this.initFromModelValue();
      
      // Update the preview sample
      this.$nextTick(() => {
        this.updatePreviewSample();
      });
    },
    methods: {
      // Get default parameters for a style
      getDefaultParams(styleName) {
        const style = BORDER_STYLES.find(s => s.name === styleName);
        if (!style) return {};
        
        const params = {};
        
        // Initialize numeric parameters with defaults
        if (style.numericParams) {
          style.numericParams.forEach(param => {
            params[param.name] = param.default;
          });
        }
        
        // Initialize color parameters with defaults
        if (style.colorParams) {
          style.colorParams.forEach(param => {
            params[param.name] = param.default;
          });
        }
        
        // Initialize boolean parameters with defaults
        if (style.booleanParams) {
          style.booleanParams.forEach(param => {
            params[param.name] = param.default;
          });
        }
        
        // Initialize select parameters with defaults
        if (style.selectParams) {
          style.selectParams.forEach(param => {
            params[param.name] = param.default;
          });
        }
        
        // Initialize text parameters with defaults
        if (style.textParams) {
          style.textParams.forEach(param => {
            params[param.name] = param.default;
          });
        }
        
        return params;
      },
      
      // Panel controls
      updateDisplayMode(newMode) {
        this.displayMode = newMode;
      },
      
      updatePanelPosition(newPosition) {
        this.panelPosition = newPosition;
      },
      
      // Initialize from model value
      initFromModelValue() {
        try {
          if (!this.tempConfig) return;
          
          // Get the model value or default
          const config = this.borderConfig;
          
          // Set style name
          this.tempConfig.styleName = config.styleName;
          
          // Get default parameters for the selected style
          const defaultParams = this.getDefaultParams(config.styleName);
          
          // Merge with parameters from the model
          this.tempConfig.params = { ...defaultParams, ...config.params };
          
          // Store original config for cancel
          this.originalConfig = {
            styleName: this.tempConfig.styleName,
            params: { ...this.tempConfig.params }
          };
        } catch (error) {
          console.error('Error initializing from model value:', error);
        }
      },
      
      // Open the editor panel
      openPanel() {
        this.initFromModelValue();
        this.panelOpen = true;
      },
      
      // Style selection
      selectStyle(style) {
        if (!this.tempConfig) return;
        
        const oldStyleName = this.tempConfig.styleName;
        this.tempConfig.styleName = style.name;
        
        // If style changed, update parameters with defaults
        if (oldStyleName !== style.name) {
          // Get default parameters for new style
          const defaultParams = this.getDefaultParams(style.name);
          
          // Preserve common parameters when possible
          const preservedParams = {};
          this.commonParamNames.forEach(paramName => {
            if (this.tempConfig.params[paramName] !== undefined) {
              preservedParams[paramName] = this.tempConfig.params[paramName];
            }
          });
          
          // Try to preserve color parameters that have the same name
          if (this.tempConfig.params.color) {
            preservedParams.color = this.tempConfig.params.color;
          }
          
          // Merge default and preserved parameters
          this.tempConfig.params = { ...defaultParams, ...preservedParams };
        }
      },
      
      // Apply selection and emit update
      applySelection() {
        if (!this.tempConfig) return;
        const result = {
          borderWidth: this.tempConfig.params.width || '2px',
          borderStyle: this.tempConfig.params.style || 'solid',
          borderColor: this.tempConfig.params.color || '#000000',
          borderRadius: this.tempConfig.params.radius || '0px'
        };
        this.$emit('update:modelValue', result);
        this.panelOpen = false;
      },
      
      // Cancel and close
      cancelSelection() {
        if (!this.tempConfig) {
          this.panelOpen = false;
          return;
        }
        
        // Restore original values
        if (this.originalConfig) {
          this.tempConfig.styleName = this.originalConfig.styleName;
          this.tempConfig.params = { ...this.originalConfig.params };
        }
        
        this.panelOpen = false;
      },
      
      // Format parameter names for display
      formatParamName(name) {
        if (!name) return '';
        
        return name
          // Insert spaces before capital letters
          .replace(/([A-Z])/g, ' $1')
          // Capitalize first letter
          .replace(/^./, str => str.toUpperCase())
          // Improve readability of specific names
          .replace('Color', 'Color')
          .replace('Radius', 'Radius')
          .replace('Width', 'Width')
          .replace('Offset', 'Offset')
          .replace('Size', 'Size')
          .replace('Blur', 'Blur')
          .replace('Opacity', 'Opacity');
      },
  
      // RENDERING METHODS
      
      // Create a unique class name for a style
      getUniqueClassName(prefix, styleName) {
        const sanitized = styleName.toLowerCase().replace(/\s+/g, '-');
        return `${prefix}-${sanitized}-${Date.now().toString(36)}`;
      },
      
      // Create a style element with CSS for a class
      createOrUpdateStyleElement(id, css) {
        let styleEl = document.getElementById(id);
        
        if (!styleEl) {
          styleEl = document.createElement('style');
          styleEl.id = id;
          document.head.appendChild(styleEl);
        }
        
        styleEl.textContent = css;
        return styleEl;
      },
      
      // Update the preview sample in the button
      updatePreviewSample() {
        if (!this.$refs.previewSample) return;
        
        const sample = this.$refs.previewSample;
        const style = BORDER_STYLES.find(s => s.name === this.borderConfig.styleName);
        
        if (!style) return;
        
        // Create a unique class name
        const className = this.getUniqueClassName('button-preview', this.borderConfig.styleName);
        
        // Generate CSS with the current parameters
        const params = {
          className,
          ...this.borderConfig.params
        };
        
        // Generate and apply CSS
        const css = style.generate(params);
        this.createOrUpdateStyleElement('button-preview-style', css);
        
        // Update the sample class and ensure it has content
        sample.className = `border-sample ${className}`;
        
        // Ensure the preview sample has content
        if (sample.innerHTML === '') {
          sample.innerHTML = '<span></span>';
        }
      },
      
      // Update the live preview
      updateLivePreview() {
        if (!this.$refs.previewWrapper || !this.tempConfig) return;
        
        const wrapper = this.$refs.previewWrapper;
        const style = BORDER_STYLES.find(s => s.name === this.tempConfig.styleName);
        
        if (!style) return;
        
        // Create a unique class name
        const className = this.getUniqueClassName('live-preview', this.tempConfig.styleName);
        
        // Generate CSS with the current parameters
        const params = {
          className,
          ...this.tempConfig.params
        };
        
        // Generate and apply CSS
        const css = style.generate(params);
        this.styleElements.livePreview = this.createOrUpdateStyleElement('live-preview-style', css);
        
        // Generate HTML with explicit dimensions for the preview
        const html = `<div class="${className} preview-content" style="width: 200px; height: 200px; background-color: #f9f9f9; display: flex; align-items: center; justify-content: center;">
          <span>Border Preview</span>
        </div>`;
        
        // Update the preview
        wrapper.innerHTML = html;
      },
      
      // Render gallery previews for all styles
      renderGalleryPreviews() {
        BORDER_STYLES.forEach(style => {
          const sanitizedName = style.name.toLowerCase().replace(/\s+/g, '-');
          const galleryElId = `gallery-${sanitizedName}`;
          const galleryEl = document.getElementById(galleryElId);
          
          if (galleryEl) {
            // Create a unique class name for this gallery item
            const className = this.getUniqueClassName('gallery', style.name);
            
            // Default parameters for preview
            const params = {
              className,
              ...this.getDefaultParams(style.name)
            };
            
            // Generate and apply CSS
            const css = style.generate(params);
            const styleId = `gallery-style-${sanitizedName}`;
            this.styleElements.galleryPreviews[styleId] = this.createOrUpdateStyleElement(styleId, css);
            
            // Generate HTML with explicit dimensions
            const html = `<div class="${className}" style="width: 100%; height: 100%; background-color: #f9f9f9;"></div>`;
            
            // Update the preview
            galleryEl.innerHTML = html;
          }
        });
      },
      
      // Update all gallery previews (call when colors change)
      updateGalleryPreviews() {
        if (this.panelOpen) {
          this.renderGalleryPreviews();
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .border-style-input {
    position: relative;
    margin-bottom: 10px;
  }
  
  /* Border Preview Button */
  .border-preview-container {
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
  
  .border-preview-container:hover {
    border-color: #aaa;
  }
  
  /* Large size variant */
  .border-preview-container.large {
    padding: 12px 8px;
  }
  
  .border-preview {
    width: 60px;
    height: 60px;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .border-sample {
    width: 50px;
    height: 50px;
    background-color: #f9f9f9;
  }
  
  .border-details {
    display: flex;
    flex-direction: column;
  }
  
  .border-name {
    font-weight: 500;
    margin-bottom: 2px;
  }
  
  .border-info {
    font-size: 12px;
    color: #666;
  }
  
  /* Border Panel Content */
  .border-panel-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    height: 100%;
    overflow-y: auto;
    padding-right: 5px;
  }
  
  /* Live Preview Area */
  .border-preview-area {
    background-color: #f9f9f9;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 20px;
  }
  
  .border-preview-area h4 {
    margin: 0 0 15px 0;
    font-size: 1.1rem;
    color: #444;
  }
  
  .preview-container {
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 30px 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .preview-wrapper {
    width: 100%;
    min-height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .preview-wrapper > div {
    width: 150px;
    height: 150px;
    background-color: #f9f9f9;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* Style Gallery */
  .style-gallery {
    background-color: #f9f9f9;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 20px;
  }
  
  .style-gallery h4 {
    margin: 0 0 15px 0;
    font-size: 1.1rem;
    color: #444;
  }
  
  .style-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 15px;
    max-height: 250px;
    overflow-y: auto;
    padding-right: 5px;
  }
  
  .style-item {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 10px;
    background-color: white;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .style-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .style-item.selected {
    background-color: #e6f0fd;
    border-color: #4a8bf5;
  }
  
  .style-preview-container {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  
  .gallery-preview-wrapper {
    width: 50px;
    height: 50px;
    background-color: #f9f9f9;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .style-name {
    font-size: 12px;
    color: #666;
    text-align: center;
    margin-top: 8px;
  }
  
  /* All Controls Sections */
  .basic-controls, 
  .color-controls, 
  .advanced-options, 
  .boolean-options, 
  .select-options,
  .text-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
    background-color: #f9f9f9;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 20px;
  }
  
  .basic-controls h4, 
  .color-controls h4, 
  .advanced-options h4, 
  .boolean-options h4, 
  .select-options h4,
  .text-options h4 {
    margin: 0 0 15px 0;
    font-size: 1.1rem;
    color: #444;
  }
  
  .control-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .control-group label {
    font-size: 14px;
    color: #666;
  }
  
  .slider-container {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .slider {
    flex: 1;
    -webkit-appearance: none;
    height: 6px;
    border-radius: 3px;
    background: #ddd;
    outline: none;
  }
  
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #4a8bf5;
    cursor: pointer;
  }
  
  .slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #4a8bf5;
    cursor: pointer;
  }
  
  .input-with-unit {
    display: flex;
    align-items: center;
    min-width: 80px;
  }
  
  .number-input {
    width: 45px;
    padding: 4px;
    border: 1px solid #ddd;
    border-radius: 4px;
    text-align: right;
  }
  
  .unit {
    margin-left: 4px;
    color: #666;
  }
  
  .text-input, .select-input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
    font-size: 14px;
  }
  
  /* Checkbox styling */
  .checkbox-group {
    flex-direction: row;
    align-items: center;
  }
  
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }
  
  .checkbox-input {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .style-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  </style>