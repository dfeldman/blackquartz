<template>
    <div class="pattern-background-selector" ref="patternSelectorContainer">
      <!-- Pattern Preview Button -->
      <PanelPreviewWrapper
        :label="label || 'Pattern Background'"
        :size="size"
        :previewStyle="previewStyle"
        :info="selectedPattern ? selectedPattern.name : ''"
        :clearEnabled="!!selectedPattern"
        @open="openPanelWrapper"
        @clear="clearSelectionAndEmit"
      />
      
      <!-- Pattern Gallery Panel using InputDetailComponent -->
      <InputDetailComponent
        v-if="panelOpen"
        :visible="panelOpen"
        :title="label || 'Pattern Gallery'"
        :display-mode="displayMode"
        :target-element="$refs.patternPreview"
        :position="panelPosition"
        :size="panelSize"
        @update:size="panelSize = $event"
        @close="cancelSelection"
        @apply="applySelection"
        @cancel="cancelSelection"
        @update:display-mode="updateDisplayMode"
        @update:position="updatePanelPosition"
      >
        <!-- Pattern Gallery Panel Content -->
        <div class="pattern-panel-content">
          <!-- Pattern Gallery View (default view) -->
          <div v-if="!editingPattern" class="pattern-gallery-view">
            <!-- Search Controls -->
            <div class="gallery-controls">
              <div class="search-container">
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  placeholder="Search patterns 2.0..." 
                  class="search-input"
                />
              </div>
            </div>
            
            <!-- Pattern Gallery Grid -->
            <div class="pattern-gallery">
              <div v-if="filteredPatterns.length === 0" class="no-results">
                No patterns found. Try adjusting your search.
              </div>
              
              <div v-else class="pattern-grid">
                <div 
                  v-for="pattern in filteredPatterns" 
                  :key="pattern.name"
                  class="pattern-item" 
                  @click="selectPatternForEditing(pattern)"
                >
                  <div class="pattern-thumbnail-container">
                    <div 
                      class="pattern-thumbnail" 
                      :style="getPatternPreviewStyle(pattern)"
                    ></div>
                  </div>
                  <div class="pattern-caption">{{ pattern.name }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Pattern Editing View (shows when a pattern is selected) -->
          <div v-if="editingPattern" class="pattern-editor-view">
            <div class="editor-header">
              <h3>{{ tempSelectedPattern.name }}</h3>
              <button class="back-to-gallery-btn" @click="backToGallery">×</button>
            </div>
            
            <!-- Pattern Preview -->
            <div class="pattern-preview-editor">
              <div 
                class="preview-display-large" 
                :style="tempPreviewStyle"
              ></div>
            </div>
            
            <!-- Pattern Parameters -->
            <div class="pattern-parameters">
              <!-- Fixed or Scrolling Mode -->
              <div class="parameter-group">
                <label>Background Attachment:</label>
                <div class="attachment-options">
                  <button 
                    class="attachment-btn" 
                    :class="{ 'active': tempPatternParams.attachment === 'scroll' }"
                    @click="setAttachmentMode('scroll')"
                  >
                    Scroll
                  </button>
                  <button 
                    class="attachment-btn" 
                    :class="{ 'active': tempPatternParams.attachment === 'fixed' }"
                    @click="setAttachmentMode('fixed')"
                  >
                    Fixed
                  </button>
                </div>
              </div>
              
              <!-- Color Parameters -->
              <div class="parameter-group" v-if="hasColorParams">
                <h5>Colors</h5>
                <div 
                  v-for="(param, index) in colorParameters" 
                  :key="`color-${index}`"
                  class="color-parameter"
                >
                  <label>{{ formatLabel(param.name) }}:</label>
                  <ThemedColorInput
                    :modelValue="tempPatternParams[param.name]"
                    :label="formatLabel(param.name)"
                    :theme="theme"
                    @update:modelValue="(val) => updateColorParam(param.name, val)"
                  />
                </div>
              </div>
              
              <!-- Numeric Parameters -->
              <div class="parameter-group" v-if="hasNumericParams">
                <h5>Size & Style</h5>
                <div 
                  v-for="(param, index) in numericParameters" 
                  :key="`numeric-${index}`"
                  class="numeric-parameter"
                >
                  <div class="slider-label">
                    <label>{{ formatLabel(param.name) }}:</label>
                    <span class="value-display">{{ tempPatternParams[param.name] }}{{ param.unit }}</span>
                  </div>
                  <div class="slider-container">
                    <input
                      type="range"
                      v-model.number="tempPatternParams[param.name]"
                      :min="param.min"
                      :max="param.max"
                      :step="getStepValue(param)"
                      class="slider-input"
                      @input="updatePatternPreview"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </InputDetailComponent>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted, reactive, watch } from 'vue';
  import InputDetailComponent from './InputDetailComponent.vue';
  import ThemedColorInput from './ThemedColorInput.vue';
  import BACKGROUND_STYLES from '../../constants/BackgroundStyles.js';
  import { usePanel } from '../../composables/usePanel';
  import PanelPreviewWrapper from '../common/PanelPreviewWrapper.vue';
  
  export default {
    name: 'PatternBackgroundSelector',
    components: {
      InputDetailComponent,
      ThemedColorInput,
      PanelPreviewWrapper
    },
    props: {
      modelValue: { 
        type: Object, 
        default: () => ({ patternId: null, params: {} }) 
      },
      label: String,
      size: { type: String, default: 'regular' }, // 'regular' or 'large'
      defaultDisplayMode: { type: String, default: 'popup' }, // 'popup', 'modal', 'tearoff', 'panel'
      theme: { type: Object, required: true }
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      // Pattern state
      const patternSelectorContainer = ref(null);
      const patternPreview = ref(null);
      const searchQuery = ref('');
      const editingPattern = ref(false);
      
      // Get patterns excluding the special cases (first 4)
      const allPatterns = computed(() => {
        return BACKGROUND_STYLES.slice(4); // Skip the first 4 special patterns
      });
      
      // Selected pattern tracking
      const selectedPattern = ref(null);
      const selectedPatternParams = ref({});
      const tempSelectedPattern = ref(null);
      const tempPatternParams = ref(reactive({}));
      
      // Filter patterns based on search query
      const filteredPatterns = computed(() => {
        if (!searchQuery.value) {
          return allPatterns.value;
        }
        
        const query = searchQuery.value.toLowerCase();
        return allPatterns.value.filter(
          pattern => pattern.name.toLowerCase().includes(query)
        );
      });
      
      // Computed properties for pattern parameters
      const colorParameters = computed(() => {
        if (!tempSelectedPattern.value) return [];
        return tempSelectedPattern.value.colorParams || [];
      });
      
      const numericParameters = computed(() => {
        if (!tempSelectedPattern.value) return [];
        return tempSelectedPattern.value.numericParams || [];
      });
      
      const hasColorParams = computed(() => colorParameters.value.length > 0);
      const hasNumericParams = computed(() => numericParameters.value.length > 0);
      
      // Preview styles
      const previewStyle = computed(() => {
        if (!selectedPattern.value) return {};
        
        // Generate a unique class name for this pattern
        const className = `pattern-preview-${selectedPattern.value.name.toLowerCase().replace(/\s+/g, '-')}`;
        
        // Get the CSS for this pattern with the current parameters
        const css = selectedPattern.value.generate({
          className,
          ...selectedPatternParams.value
        });
        
        // Extract the background properties from the CSS
        const backgroundProps = extractBackgroundProps(css);
        
        return {
          ...backgroundProps,
          width: '100%',
          height: '100%'
        };
      });
      
      const tempPreviewStyle = computed(() => {
        if (!tempSelectedPattern.value) return {};
        
        // Generate a unique class name for this pattern
        const className = `pattern-preview-${tempSelectedPattern.value.name.toLowerCase().replace(/\s+/g, '-')}`;
        
        // Get the CSS for this pattern with the current parameters
        const css = tempSelectedPattern.value.generate({
          className,
          ...tempPatternParams.value
        });
        
        // Extract the background properties from the CSS
        const backgroundProps = extractBackgroundProps(css);
        
        return {
          ...backgroundProps,
          width: '100%',
          height: '100%'
        };
      });
      
      // Helper function to extract background properties from CSS string
      const extractBackgroundProps = (css) => {
        const props = {};
        
        // Match all background-* properties
        const bgProps = css.match(/background[^:]*:[^;]*/g);
        
        if (bgProps) {
          bgProps.forEach(prop => {
            const [name, value] = prop.split(':').map(p => p.trim());
            props[name] = value;
          });
        }
        
        return props;
      };
      
      // Initialize from model value
      const initFromModelValue = () => {
        if (props.modelValue && props.modelValue.patternId) {
          // Find the pattern by ID
          const pattern = allPatterns.value.find(
            p => p.name === props.modelValue.patternId
          );
          
          if (pattern) {
            selectedPattern.value = pattern;
            selectedPatternParams.value = { ...props.modelValue.params };
          }
        } else {
          selectedPattern.value = null;
          selectedPatternParams.value = {};
        }
      };
      
      // Use the composable for panel state
      const { panelOpen, displayMode, panelPosition, panelSize, openPanel, updateDisplayMode, updatePanelPosition } = usePanel(props.defaultDisplayMode, { width: '800px', height: '700px' });
      
      // Select a pattern in the panel for editing
      const selectPatternForEditing = (pattern) => {
        tempSelectedPattern.value = pattern;
        
        // Initialize default parameters for this pattern
        const params = { attachment: 'scroll' }; // Default to scroll mode
        
        // Add color parameters
        if (pattern.colorParams) {
          pattern.colorParams.forEach(param => {
            params[param.name] = param.default;
          });
        }
        
        // Add numeric parameters
        if (pattern.numericParams) {
          pattern.numericParams.forEach(param => {
            params[param.name] = param.default;
          });
        }
        
        tempPatternParams.value = params;
        editingPattern.value = true;
      };
      
      // Go back to the gallery view
      const backToGallery = () => {
        editingPattern.value = false;
        tempSelectedPattern.value = null;
        tempPatternParams.value = {};
      };
      
      // Get pattern preview style for thumbnails
      const getPatternPreviewStyle = (pattern) => {
        // Create default params for preview
        const defaultParams = { attachment: 'scroll' };
        
        // Add default color parameters
        if (pattern.colorParams) {
          pattern.colorParams.forEach(param => {
            defaultParams[param.name] = param.default;
          });
        }
        
        // Add default numeric parameters
        if (pattern.numericParams) {
          pattern.numericParams.forEach(param => {
            defaultParams[param.name] = param.default;
          });
        }
        
        // Generate a unique class name for this pattern
        const className = `pattern-thumb-${pattern.name.toLowerCase().replace(/\s+/g, '-')}`;
        
        // Get the CSS for this pattern with default parameters
        const css = pattern.generate({
          className,
          ...defaultParams
        });
        
        // Extract the background properties from the CSS
        const backgroundProps = extractBackgroundProps(css);
        
        // Add explicit height for the preview to ensure visibility
        return {
          ...backgroundProps,
          height: '100%',
          width: '100%'
        };
      };
      
      // Set attachment mode (fixed or scroll)
      const setAttachmentMode = (mode) => {
        tempPatternParams.value.attachment = mode;
        updatePatternPreview();
      };
      
      // Update pattern preview when parameters change
      const updatePatternPreview = () => {
        // Force reactivity update by creating a new reference
        tempPatternParams.value = { ...tempPatternParams.value };
      };
      
      // Handle color parameter updates - THIS IS THE KEY FIX FOR COLORS
      const updateColorParam = (paramName, newValue) => {
        // Check the format of the value coming from ThemedColorInput
        if (typeof newValue === 'object' && newValue !== null) {
          // If it's an object with light/dark properties, use the light color
          if (newValue.light) {
            tempPatternParams.value[paramName] = newValue.light;
          }
        } else if (typeof newValue === 'number') {
          // If it's a theme index, get the actual color from the theme
          const themeColor = props.theme.colorTheme.light[newValue - 1];
          if (themeColor) {
            tempPatternParams.value[paramName] = themeColor;
          }
        } else {
          // It's already a simple color string
          tempPatternParams.value[paramName] = newValue;
        }
        
        // Force the preview to update
        updatePatternPreview();
      };
      
      // Format parameter label (camelCase to Title Case)
      const formatLabel = (name) => {
        return name
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase());
      };
      
      // Get step value for numeric sliders
      const getStepValue = (param) => {
        // If the range is small, use a smaller step value
        if (param.max - param.min <= 10) {
          return 0.1;
        }
        // If the range is medium, use a medium step value
        else if (param.max - param.min <= 100) {
          return 1;
        }
        // For large ranges, use a larger step value
        else {
          return Math.max(1, Math.floor((param.max - param.min) / 100));
        }
      };
      
      // Apply selection and emit update
      const applySelection = () => {
        if (editingPattern.value && tempSelectedPattern.value) {
          selectedPattern.value = tempSelectedPattern.value;
          selectedPatternParams.value = { ...tempPatternParams.value };
          
          // Emit updated model value in standardized format
          emit('update:modelValue', {
            type: 'cssPattern',
            value: {
              patternId: selectedPattern.value.name,
              params: { ...selectedPatternParams.value }
            }
          });
        }
        
        panelOpen.value = false;
        editingPattern.value = false;
      };
      
      // Cancel and close
      const cancelSelection = () => {
        panelOpen.value = false;
        editingPattern.value = false;
      };
      
      // Clear selection and emit update from the main button
      const clearSelectionAndEmit = () => {
        selectedPattern.value = null;
        selectedPatternParams.value = {};
        tempSelectedPattern.value = null;
        tempPatternParams.value = {};
        
        emit('update:modelValue', { patternId: null, params: {} });
      };
      
      // Initialize from model value on component mount
      onMounted(() => {
        initFromModelValue();
      });
      
      // Watch for changes in the model value
      watch(() => props.modelValue, (newValue) => {
        initFromModelValue();
      }, { deep: true });
      
      // Open the panel with a wrapper to reset editing state
      const openPanelWrapper = () => {
        editingPattern.value = false;
        initFromModelValue();
        openPanel();
      };
      
      return {
        // State
        panelOpen,
        displayMode,
        panelPosition,
        panelSize,
        searchQuery,
        selectedPattern,
        selectedPatternParams,
        tempSelectedPattern,
        tempPatternParams,
        filteredPatterns,
        allPatterns,
        editingPattern,
        
        // Computed
        previewStyle,
        tempPreviewStyle,
        colorParameters,
        numericParameters,
        hasColorParams,
        hasNumericParams,
        
        // Refs
        patternSelectorContainer,
        patternPreview,
        
        // Methods
        updateDisplayMode,
        updatePanelPosition,
        openPanel: openPanelWrapper,
        selectPatternForEditing,
        backToGallery,
        applySelection,
        cancelSelection,
        clearSelectionAndEmit,
        getPatternPreviewStyle,
        setAttachmentMode,
        formatLabel,
        getStepValue,
        updatePatternPreview,
        updateColorParam
      };
    }
  };
  </script>
  
  <style scoped>
  .pattern-background-selector {
    position: relative;
    margin-bottom: 10px;
  }
  
  /* Pattern Preview Button */
  .pattern-preview-container {
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
  
  .pattern-preview-container:hover {
    border-color: #aaa;
  }
  
  /* Large size variant */
  .pattern-preview-container.large {
    padding: 12px 8px;
  }
  
  .pattern-preview {
    width: 80px;
    height: 80px;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #eee;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .pattern-preview-display {
    width: 100%;
    height: 100%; /* Fixed: Ensure full height */
  }
  
  .pattern-details {
    display: flex;
    flex-direction: column;
  }
  
  .pattern-name {
    font-weight: 500;
    margin-bottom: 2px;
  }
  
  .pattern-info {
    font-size: 12px;
    color: #666;
  }
  
  /* Clear button */
  .clear-preview-btn {
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
  
  .clear-preview-btn:hover {
    background-color: #f0f0f0;
    color: #555;
  }
  
  /* Pattern Panel Content */
  .pattern-panel-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }
  
  /* Gallery View */
  .pattern-gallery-view {
    display: flex;
    flex-direction: column;
    gap: 20px;
    height: 100%;
  }
  
  /* Search Controls */
  .gallery-controls {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
  }
  
  .search-container {
    flex: 1;
  }
  
  .search-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }
  
  /* Pattern Gallery Grid */
  .pattern-gallery {
    flex: 1;
    overflow-y: auto;
    padding-right: 5px;
  }
  
  .pattern-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
    padding-bottom: 20px;
  }
  
  .pattern-item {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    background-color: white;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .pattern-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .pattern-thumbnail-container {
    width: 100%;
    height: 120px; /* Fixed: Ensure thumbnail has proper height */
    overflow: hidden;
  }
  
  .pattern-thumbnail {
    width: 100%;
    height: 100%;
  }
  
  .pattern-caption {
    padding: 8px;
    font-size: 12px;
    color: #666;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background-color: #f9f9f9;
    border-top: 1px solid #eee;
  }
  
  /* Pattern Editor View */
  .pattern-editor-view {
    display: flex;
    flex-direction: column;
    gap: 20px;
    height: 100%;
    overflow-y: auto;
  }
  
  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
  }
  
  .editor-header h3 {
    margin: 0;
    font-size: 18px;
    color: #333;
  }
  
  .back-to-gallery-btn {
    background: none;
    border: none;
    color: #999;
    font-size: 24px;
    cursor: pointer;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  
  .back-to-gallery-btn:hover {
    background-color: #f0f0f0;
    color: #555;
  }
  
  /* Pattern Preview in Editor */
  .pattern-preview-editor {
    width: 100%;
    margin-bottom: 20px;
    height: 250px; /* Fixed: Make preview editor taller */
  }
  
  .preview-display-large {
    width: 100%;
    height: 200px; /* Fixed: Ensure preview display has proper height */
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  /* Pattern Parameters */
  .pattern-parameters {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .parameter-group {
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
  }
  
  .parameter-group:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
  
  .parameter-group h5 {
    margin: 0 0 15px 0;
    font-size: 16px;
    color: #555;
  }
  
  .parameter-group label {
    font-size: 14px;
    color: #444;
    margin-bottom: 8px;
    display: block;
  }
  
  /* Attachment Options */
  .attachment-options {
    display: flex;
    gap: 10px;
    margin-top: 8px;
  }
  
  .attachment-btn {
    padding: 6px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: #f5f5f5;
    color: #333;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .attachment-btn.active {
    background-color: #4a8bf5;
    border-color: #4a8bf5;
    color: white;
    font-weight: 500;
  }
  
  .attachment-btn:hover {
    background-color: #e8e8e8;
  }
  
  .attachment-btn.active:hover {
    background-color: #3a7ce5;
  }
  
  /* Color Parameters */
  .color-parameter {
    margin-bottom: 15px;
  }
  
  .color-parameter:last-child {
    margin-bottom: 0;
  }
  
  /* Numeric Parameters */
  .numeric-parameter {
    margin-bottom: 15px;
  }
  
  .numeric-parameter:last-child {
    margin-bottom: 0;
  }
  
  .slider-label {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
  }
  
  .slider-label label {
    margin-bottom: 0;
  }
  
  .value-display {
    font-size: 14px;
    color: #666;
    font-weight: 500;
  }
  
  .slider-container {
    width: 100%;
  }
  
  .slider-input {
    width: 100%;
    appearance: none;
    background: #e0e0e0;
    height: 6px;
    border-radius: 3px;
    outline: none;
  }
  
  .slider-input::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #4a8bf5;
    cursor: pointer;
  }
  
  .slider-input::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #4a8bf5;
    cursor: pointer;
  }
  
  /* Status Messages */
  .no-results {
    padding: 40px 20px;
    text-align: center;
    color: #666;
    font-size: 16px;
    background-color: #f9f9f9;
    border-radius: 8px;
    margin: 20px 0;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .pattern-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }
    
    .preview-display-large {
      height: 150px;
    }
  }
  </style>
