<template>
    <div class="section-break-input" ref="sectionBreakInputContainer">
      <!-- Section Break Preview Button -->
      <div 
        class="section-preview-container" 
        :class="{ 'large': size === 'large' }"
        @click="openPanel"
        ref="sectionPreview"
      >
        <div class="section-preview">
          <div 
            class="section-sample" 
            :style="previewButtonStyle"
            :class="'sample-' + sectionConfig.styleName.toLowerCase().replace(/\s+/g, '-')"
          ></div>
        </div>
        <div class="section-details">
          <div class="section-name">{{ label || 'Section Break' }}</div>
          <div class="section-info">{{ sectionConfig.styleName }} · {{ sectionConfig.params.height }}px</div>
        </div>
      </div>
      
      <!-- Section Break Panel using InputDetailComponent -->
      <InputDetailComponent
        v-if="tempConfig"
        :visible="panelOpen"
        :title="label || 'Section Break Editor'"
        :display-mode="displayMode"
        :target-element="$refs.sectionPreview"
        :position="panelPosition"
        :size="panelSize"
        @update:size="panelSize = $event"
        @close="cancelSelection"
        @apply="applySelection"
        @cancel="cancelSelection"
        @update:display-mode="updateDisplayMode"
        @update:position="updatePanelPosition"
      >
        <!-- Section Break Configuration Panel Content -->
        <div class="section-panel-content">
          <!-- Live Preview Area -->
          <div class="section-preview-area">
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
                v-for="style in SECTION_BREAKS" 
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
          
          <!-- Alignment Controls -->
          <div class="alignment-controls">
            <h4>Alignment</h4>
            <div class="alignment-buttons">
              <button 
                class="alignment-btn" 
                :class="{ 'active': tempConfig.params.alignment === 'left' }"
                @click="tempConfig.params.alignment = 'left'"
                title="Align Left"
              >
                <span class="align-icon left-align"></span>
              </button>
              <button 
                class="alignment-btn" 
                :class="{ 'active': tempConfig.params.alignment === 'center' }"
                @click="tempConfig.params.alignment = 'center'"
                title="Align Center"
              >
                <span class="align-icon center-align"></span>
              </button>
              <button 
                class="alignment-btn" 
                :class="{ 'active': tempConfig.params.alignment === 'right' }"
                @click="tempConfig.params.alignment = 'right'"
                title="Align Right"
              >
                <span class="align-icon right-align"></span>
              </button>
            </div>
          </div>
          
          <!-- Parameter Controls -->
          <div class="section-controls">
            <h4>Dimensions</h4>
            
            <!-- Common Parameters (width, height, margins) -->
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
            
            <!-- Style-specific other parameters -->
            <div 
              v-for="param in otherParams" 
              :key="param.name"
              class="control-group"
            >
              <label>{{ formatParamName(param.name) }}</label>
              <input 
                v-if="param.type === 'text'" 
                type="text" 
                v-model="tempConfig.params[param.name]"
                class="text-input"
              >
              <select 
                v-else-if="param.type === 'select'" 
                v-model="tempConfig.params[param.name]"
                class="select-input"
              >
                <option 
                  v-for="option in param.options" 
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </InputDetailComponent>
    </div>
  </template>
  
  <script>
/**
 * SectionBreakInput
 * ================
 * A component for selecting and configuring decorative section breaks and dividers
 * with real-time visual preview and extensive customization options.
 * 
 * FEATURES:
 * - Visual section break preview and selection
 * - Gallery of section break styles with thumbnails
 * - Live preview with real-time updates
 * - Customizable parameters (height, width, margins)
 * - Alignment controls (left, center, right)
 * - Support for style-specific parameters
 * - Theme color integration for consistent styling
 * - Responsive design with mobile adaptations
 * 
 * BASIC USAGE:
 * ```vue
 * <SectionBreakInput
 *   v-model="sectionBreak"
 *   label="Page Divider"
 *   :color1="themeColors.primary"
 * />
 * ```
 * 
 * PROPS:
 * @prop {Object} modelValue - Section break configuration object (required)
 * @prop {String} label - Label for the component
 * @prop {String} size - UI size variant: 'regular' or 'large' (default: 'regular')
 * @prop {String} defaultDisplayMode - Initial display mode: 'popup', 'modal', 'tearoff', 'panel' (default: 'popup')
 * @prop {String|Number|Object} color1 - Primary color for the section break (default: '#333333')
 * @prop {String|Number|Object} color2 - Secondary color for shadows and accents (default: 'rgba(0, 0, 0, 0.3)')
 * @prop {String} colorMode - Current color mode: 'light' or 'dark' (default: 'light')
 * 
 * EVENTS:
 * @emits {update:modelValue} - When the section break configuration changes
 * 
 * MODEL VALUE FORMAT:
 * The component expects and returns a configuration object:
 * {
 *   styleName: "Style Name", // Name of the selected style
 *   params: {                // Parameters for the style
 *     width: 100,            // Width as percentage (common)
 *     height: 4,             // Height in pixels (common)
 *     marginTop: 20,         // Top margin in pixels (common)
 *     marginBottom: 20,      // Bottom margin in pixels (common)
 *     alignment: "center",   // Alignment: 'left', 'center', 'right' (common)
 *     // Additional style-specific parameters...
 *   }
 * }
 * 
 * COMMON PARAMETERS:
 * - width: Width as percentage (0-100)
 * - height: Height in pixels
 * - marginTop: Top margin in pixels
 * - marginBottom: Bottom margin in pixels
 * - alignment: 'left', 'center', or 'right'
 * 
 * STYLE-SPECIFIC PARAMETERS:
 * Each section break style may have additional parameters like:
 * - dashLength: Length of dashes for dashed lines
 * - dotSpacing: Spacing between dots for dotted lines
 * - shadowSize: Size of shadow effects
 * - waveDensity: Density of wave patterns
 * - symbolCount: Number of symbols for symbol-based dividers
 * 
 * INTERNAL BEHAVIOR:
 * - Renders a gallery of available section break styles
 * - Provides real-time preview of the current configuration
 * - Dynamically generates CSS for each section break style
 * - Manages style-specific parameters based on selected style
 * - Creates unique class names to prevent style conflicts
 * - Adapts to theme colors for consistent styling
 * - Preserves common parameters when switching styles
 * 
 * DEPENDENCIES:
 * - Requires InputDetailComponent for the configuration panel
 * - Uses SECTION_BREAKS constant for style definitions
 * - Uses ThemeUtils for color management
 * 
 * STYLING:
 * - Main container: .section-break-input
 * - Preview button: .section-preview-container, .section-sample
 * - Size variants: .section-preview-container.large
 * - Panel content: .section-panel-content
 * - Live preview: .section-preview-area, .preview-container
 * - Style gallery: .style-gallery, .style-grid, .style-item
 * - Selected state: .style-item.selected
 * - Controls: .section-controls, .advanced-options, .alignment-controls
 * - Input elements: .slider, .number-input, .text-input, .select-input
 * - Media queries for responsive layouts
 * 
 * RENDERING:
 * - Each style is rendered with its own unique CSS class
 * - Live preview updates in real-time as parameters change
 * - Gallery previews are rendered with default parameters
 * - CSS is generated dynamically based on style definitions
 * 
 * EXAMPLES:
 * 
 * Basic section break:
 * ```vue
 * <SectionBreakInput
 *   v-model="pageDivider"
 *   label="Page Divider"
 * />
 * ```
 * 
 * With theme colors:
 * ```vue
 * <SectionBreakInput
 *   v-model="headerDivider"
 *   label="Header Divider"
 *   :color1="themeColors.accent"
 *   :color2="themeColors.shadow"
 *   color-mode="dark"
 * />
 * ```
 * 
 * Custom size and display mode:
 * ```vue
 * <SectionBreakInput
 *   v-model="sectionBreak"
 *   label="Section Break"
 *   size="large"
 *   default-display-mode="modal"
 * />
 * ```
 * 
 * Initial configuration:
 * ```js
 * export default {
 *   data() {
 *     return {
 *       sectionBreak: {
 *         styleName: "Double Line",
 *         params: {
 *           width: 80,
 *           height: 5,
 *           marginTop: 30,
 *           marginBottom: 30,
 *           alignment: "center",
 *           spacing: 3 // Style-specific parameter
 *         }
 *       }
 *     };
 *   }
 * }
 * ```
 */


  import { reactive, nextTick } from 'vue';
  import InputDetailComponent from './InputDetailComponent.vue';
  import SECTION_BREAKS from '../../constants/SectionBreaks.js';
  import ThemeUtils from '../../services/ThemeUtils.js';
  
  export default {
    name: 'SectionBreakInput',
    components: {
      InputDetailComponent
    },
    props: {
      modelValue: { required: true },
      label: String,
      size: { type: String, default: 'regular' }, // 'regular' or 'large'
      defaultDisplayMode: { type: String, default: 'popup' }, // 'popup', 'modal', 'tearoff', 'panel'
      color1: { default: '#333333' }, // Can be a color string, a number (theme index), or an object {light, dark}
      color2: { default: 'rgba(0, 0, 0, 0.3)' }, // For shadows and secondary colors
      colorMode: { type: String, default: 'light' } // 'light' or 'dark'
    },
    emits: ['update:modelValue'],
    data() {
      return {
        panelOpen: false,
        displayMode: this.defaultDisplayMode,
        panelPosition: { top: '0px', left: '0px' },
        panelSize: { width: '650px', height: '700px' },
        SECTION_BREAKS, // Make the array available to the template
        
        // Temporary configuration during editing
        tempConfig: null, // Will be initialized in mounted
        
        // Original configuration before editing
        originalConfig: null,
        
        // Define common parameters that appear for all styles
        commonParamNames: ['width', 'height', 'marginTop', 'marginBottom'],
        
        // Style elements and IDs for render management
        styleElements: {
          livePreview: null,
          galleryPreviews: {}
        }
      };
    },
    computed: {
      // Parse the section break configuration from the model value
      sectionConfig() {
        if (typeof this.modelValue === 'object' && this.modelValue.styleName) {
          return {
            styleName: this.modelValue.styleName,
            params: { ...this.modelValue.params } // Clone to avoid mutation
          };
        }
        
        // Default to the first style if no valid configuration
        const defaultStyle = SECTION_BREAKS[0];
        return {
          styleName: defaultStyle.name,
          params: this.getDefaultParams(defaultStyle.name)
        };
      },
      
      // Get the selected style object
      selectedStyle() {
        if (!this.tempConfig) {
          // Fallback to first style if tempConfig not initialized
          return SECTION_BREAKS[0];
        }
        
        return SECTION_BREAKS.find(style => style.name === this.tempConfig.styleName) || SECTION_BREAKS[0];
      },
      
      // Get common parameters for the UI
      commonParams() {
        if (!this.selectedStyle) return [];
        
        return this.selectedStyle.numericParams.filter(param => 
          this.commonParamNames.includes(param.name)
        );
      },
      
      // Get style-specific numeric parameters for the UI
      styleSpecificParams() {
        if (!this.selectedStyle) return [];
        
        return this.selectedStyle.numericParams.filter(param => 
          !this.commonParamNames.includes(param.name)
        );
      },
      
      // Get other parameters for the UI
      otherParams() {
        if (!this.selectedStyle || !this.selectedStyle.otherParams) return [];
        
        return this.selectedStyle.otherParams;
      },
      
      // Get primary color with ThemeUtils
      primaryColor() {
        return ThemeUtils.getCurrentColor(this.color1, this.colorMode);
      },
      
      // Get secondary color with ThemeUtils
      secondaryColor() {
        return ThemeUtils.getCurrentColor(this.color2, this.colorMode);
      },
      
      // Style for the preview button
      previewButtonStyle() {
        // Basic preview style for the button
        return {
          width: '100%',
          height: `${this.sectionConfig.params.height || 3}px`,
          backgroundColor: this.primaryColor
        };
      }
    },
    watch: {
      modelValue: {
        handler() {
          if (this.tempConfig) {
            this.initFromModelValue();
          }
        },
        deep: true
      },
      
      // Update when color mode changes
      colorMode() {
        this.$forceUpdate();
        this.updateLivePreview();
        this.updateGalleryPreviews();
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
      const defaultStyle = SECTION_BREAKS[0];
      this.tempConfig = reactive({
        styleName: defaultStyle.name,
        params: this.getDefaultParams(defaultStyle.name)
      });
      
      // Initialize from model value
      this.initFromModelValue();
    },
    methods: {
      // Get default parameters for a style
      getDefaultParams(styleName) {
        const style = SECTION_BREAKS.find(s => s.name === styleName);
        if (!style) return {};
        
        const params = { alignment: 'center' }; // Always include alignment
        
        // Initialize numeric parameters with defaults
        if (style.numericParams) {
          style.numericParams.forEach(param => {
            params[param.name] = param.default;
          });
        }
        
        // Initialize color parameters with defaults
        if (style.colorParams) {
          style.colorParams.forEach(param => {
            // Use primaryColor or secondaryColor from props if available
            if (param.name === 'primaryColor') {
              params[param.name] = this.primaryColor;
            } else if (param.name === 'shadowColor' || param.name === 'secondaryColor') {
              params[param.name] = this.secondaryColor;
            } else {
              params[param.name] = param.default;
            }
          });
        }
        
        // Initialize other parameters with defaults
        if (style.otherParams) {
          style.otherParams.forEach(param => {
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
          const config = this.sectionConfig;
          
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
          
          // Preserve common parameters and alignment
          const preservedParams = {};
          this.commonParamNames.forEach(paramName => {
            if (this.tempConfig.params[paramName] !== undefined) {
              preservedParams[paramName] = this.tempConfig.params[paramName];
            }
          });
          
          // Preserve alignment
          preservedParams.alignment = this.tempConfig.params.alignment || 'center';
          
          // Merge default and preserved parameters
          this.tempConfig.params = { ...defaultParams, ...preservedParams };
        }
      },
      
      // Apply selection and emit update
      applySelection() {
        if (!this.tempConfig) return;
        
        // Create result object
        const result = {
          styleName: this.tempConfig.styleName,
          params: { ...this.tempConfig.params }
        };
        
        // Emit update
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
        return name
          // Insert spaces before capital letters
          .replace(/([A-Z])/g, ' $1')
          // Capitalize first letter
          .replace(/^./, str => str.toUpperCase())
          // Improve readability of specific names
          .replace('Margin Top', 'Margin Top')
          .replace('Margin Bottom', 'Margin Bottom')
          .replace('Wave Density', 'Wave Density')
          .replace('Symbol Count', 'Symbol Count')
          .replace('Dash Length', 'Dash Length')
          .replace('Dot Spacing', 'Dot Spacing')
          .replace('Shadow Size', 'Shadow Size');
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
      
      // Update the live preview
      updateLivePreview() {
        if (!this.$refs.previewWrapper || !this.tempConfig) return;
        
        const wrapper = this.$refs.previewWrapper;
        const style = SECTION_BREAKS.find(s => s.name === this.tempConfig.styleName);
        
        if (!style) return;
        
        // Create a unique class name
        const className = this.getUniqueClassName('live-preview', this.tempConfig.styleName);
        
        // Generate CSS with the current parameters
        const params = {
          className,
          ...this.tempConfig.params,
          primaryColor: this.primaryColor,
          secondaryColor: this.secondaryColor
        };
        
        // Generate and apply CSS
        const css = style.generate(params);
        this.styleElements.livePreview = this.createOrUpdateStyleElement('live-preview-style', css);
        
        // Generate HTML for the style
        const html = style.html ? style.html(className, params) : `<div class="${className}"></div>`;
        
        // Update the preview
        wrapper.innerHTML = html;
      },
      
      // Render gallery previews for all styles
      renderGalleryPreviews() {
        SECTION_BREAKS.forEach(style => {
          const sanitizedName = style.name.toLowerCase().replace(/\s+/g, '-');
          const galleryElId = `gallery-${sanitizedName}`;
          const galleryEl = document.getElementById(galleryElId);
          
          if (galleryEl) {
            // Create a unique class name for this gallery item
            const className = this.getUniqueClassName('gallery', style.name);
            
            // Default parameters for preview
            const params = {
              className,
              ...this.getDefaultParams(style.name),
              primaryColor: this.primaryColor,
              secondaryColor: this.secondaryColor,
              // Override with small sizes for gallery
              width: 100,
              height: style.numericParams.find(p => p.name === 'height')?.default || 3,
              marginTop: 0,
              marginBottom: 0
            };
            
            // Generate and apply CSS
            const css = style.generate(params);
            const styleId = `gallery-style-${sanitizedName}`;
            this.styleElements.galleryPreviews[styleId] = this.createOrUpdateStyleElement(styleId, css);
            
            // Generate HTML
            const html = style.html ? style.html(className, params) : `<div class="${className}"></div>`;
            
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
  .section-break-input {
    position: relative;
    margin-bottom: 10px;
  }
  
  /* Section Preview Button */
  .section-preview-container {
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
  
  .section-preview-container:hover {
    border-color: #aaa;
  }
  
  /* Large size variant */
  .section-preview-container.large {
    padding: 12px 8px;
  }
  
  .section-preview {
    width: 80px;
    margin-right: 12px;
    display: flex;
    align-items: center;
  }
  
  .section-sample {
    width: 100%;
    height: 4px;
    background-color: #333;
  }
  
  .large .section-sample {
    height: 6px;
  }
  
  .section-details {
    display: flex;
    flex-direction: column;
  }
  
  .section-name {
    font-weight: 500;
    margin-bottom: 2px;
  }
  
  .section-info {
    font-size: 12px;
    color: #666;
  }
  
  /* Section Panel Content */
  .section-panel-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    height: 100%;
    overflow-y: auto;
    padding-right: 5px;
  }
  
  /* Live Preview Area */
  .section-preview-area {
    background-color: #f9f9f9;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 20px;
  }
  
  .section-preview-area h4 {
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
    min-height: 60px;
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
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  
  .gallery-preview-wrapper {
    width: 100%;
    height: 100%;
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
  
  /* Section Controls */
  .section-controls, .advanced-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
    background-color: #f9f9f9;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 20px;
  }
  
  .section-controls h4, .advanced-options h4 {
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
  
  /* Alignment Controls */
  .alignment-controls {
    background-color: #f9f9f9;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 20px;
  }
  
  .alignment-controls h4 {
    margin: 0 0 15px 0;
    font-size: 1.1rem;
    color: #444;
  }
  
  .alignment-buttons {
    display: flex;
    gap: 10px;
  }
  
  .alignment-btn {
    width: 40px;
    height: 40px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .alignment-btn.active {
    background-color: #e6f0fd;
    border-color: #4a8bf5;
  }
  
  .align-icon {
    display: block;
    width: 20px;
    height: 2px;
    background-color: #333;
    position: relative;
  }
  
  .left-align {
    margin-right: auto;
    width: 15px;
  }
  
  .center-align {
    margin: 0 auto;
  }
  
  .right-align {
    margin-left: auto;
    width: 15px;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .style-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  </style>