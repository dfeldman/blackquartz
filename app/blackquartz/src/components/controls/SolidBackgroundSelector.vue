<template>
    <div class="solid-background-selector" ref="selectorContainer">
      <!-- Temporary test button to trigger panel open -->
      <button @click="openPanel" style="margin-bottom:10px;">Test Open Panel</button>
      
      <!-- New markup using PanelPreviewWrapper -->
      <PanelPreviewWrapper
        ref="backgroundPreview"
        :label="label || 'Solid Background'"
        :size="size"
        :previewStyle="previewStyle"
        :info="hasColor ? (colorLabel + (enableOpacity ? ` (${Math.round(tempOpacity * 100)}% opacity)` : '')) : ''"
        :clearEnabled="hasColor"
        @open="openPanel"
        @clear="clearSelectionAndEmit"
      />
      
      <!-- Color Panel using InputDetailComponent -->
      <InputDetailComponent
        v-if="panelOpen"
        :visible="panelOpen"
        :title="label || 'Solid Background'"
        :display-mode="displayMode"
        :target-element="$refs.backgroundPreview?.$el"
        :position="panelPosition"
        :size="panelSize"
        @update:size="panelSize = $event"
        @close="cancelSelection"
        @apply="applySelection"
        @cancel="cancelSelection"
        @update:display-mode="updateDisplayMode"
        @update:position="updatePanelPosition"
      >
        <!-- Color Panel Content -->
        <div class="color-panel-content">
          <!-- Color Preview -->
          <div class="background-preview-editor">
            <div 
              class="preview-display-large" 
              :style="tempPreviewCombinedStyle"
            ></div>
          </div>
          
          <!-- Color Control -->
          <div class="background-parameters">
            <!-- Color Input -->
            <div class="parameter-group">
              <label>Background Color:</label>
              <div class="color-input-wrapper">
                <ThemedColorInput
                  :modelValue="tempColor"
                  label="Background Color"
                  :theme="theme"
                  @update:modelValue="updateColor"
                />
              </div>
            </div>
            
            <!-- Opacity Slider (optional) -->
            <div class="parameter-group" v-if="enableOpacity">
              <div class="slider-label">
                <label>Opacity:</label>
                <span class="value-display">{{ Math.round(tempOpacity * 100) }}%</span>
              </div>
              <div class="slider-container">
                <input
                  type="range"
                  v-model.number="tempOpacity"
                  min="0"
                  max="1"
                  step="0.01"
                  class="slider-input"
                />
              </div>
            </div>
          </div>
        </div>
      </InputDetailComponent>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted, watch } from 'vue';
  import InputDetailComponent from './InputDetailComponent.vue';
  import ThemedColorInput from './ThemedColorInput.vue';
  import { getBackgroundStyle } from '../../utils/styleHelpers';
  import { usePanel } from '../../composables/usePanel';
  import PanelPreviewWrapper from '../common/PanelPreviewWrapper.vue';
  
  export default {
    name: 'SolidBackgroundSelector',
    components: {
      InputDetailComponent,
      ThemedColorInput,
      PanelPreviewWrapper
    },
    props: {
      modelValue: { 
        type: Object, 
        default: () => ({ color: null, opacity: 1 }) 
      },
      label: String,
      size: { type: String, default: 'regular' }, // 'regular' or 'large'
      defaultDisplayMode: { type: String, default: 'popup' }, // 'popup', 'modal', 'tearoff', 'panel'
      theme: { type: Object, required: true },
      enableOpacity: { type: Boolean, default: true }
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      // Use the composable for panel state
      const { panelOpen, displayMode, panelPosition, panelSize, openPanel, updateDisplayMode, updatePanelPosition } = usePanel(props.defaultDisplayMode, { width: '400px', height: '350px' });
      
      // Background state
      const selectorContainer = ref(null);
      const backgroundPreview = ref(null);
      
      // Color and opacity state
      const tempColor = ref(null);
      const tempOpacity = ref(1);
      
      // Computed properties
      const hasColor = computed(() => {
        return !!props.modelValue.color;
      });
      
      const colorLabel = computed(() => {
        if (!props.modelValue.color) return '';
        
        if (typeof props.modelValue.color === 'object' && props.modelValue.color.light) {
          return `Light: ${props.modelValue.color.light}, Dark: ${props.modelValue.color.dark}`;
        } else if (typeof props.modelValue.color === 'number') {
          return `Theme Color ${props.modelValue.color}`;
        } else {
          return props.modelValue.color;
        }
      });
      
      // Preview styles
      const previewStyle = computed(() => {
        if (!props.modelValue.color) return {};
        return getBackgroundStyle(props.modelValue.color, props.modelValue.opacity);
      });
      
      const tempPreviewStyle = computed(() => {
        if (!tempColor.value) return {};
        return getBackgroundStyle(tempColor.value, tempOpacity.value);
      });
      
      // New computed property for the tearoff panel preview style
      const tempPreviewCombinedStyle = computed(() => {
        if (!tempColor.value) return { width: '100%', height: '150px' };
        return { ...getBackgroundStyle(tempColor.value, tempOpacity.value), width: '100%', height: '150px' };
      });
      
      // Helper functions
      const getBackgroundStyle = (color, opacity) => {
        let backgroundColor;
        
        if (typeof color === 'object' && color.light) {
          // Object with light/dark modes
          backgroundColor = color.light;
        } else if (typeof color === 'number') {
          // Theme index
          const themeColor = props.theme.colorTheme.light[color - 1];
          backgroundColor = themeColor || '#FFFFFF';
        } else {
          // Simple color string
          backgroundColor = color;
        }
        
        // Handle opacity if enabled
        if (props.enableOpacity && opacity !== undefined && opacity < 1) {
          // Split the hex color into RGB components to add opacity
          if (backgroundColor && backgroundColor.startsWith('#')) {
            const hex = backgroundColor.slice(1);
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            return { backgroundColor: `rgba(${r}, ${g}, ${b}, ${opacity})` };
          } else {
            return { backgroundColor, opacity };
          }
        } else {
          return { backgroundColor };
        }
      };
      
      // Initialize from model value
      const initFromModelValue = () => {
        tempColor.value = props.modelValue.color || null;
        tempOpacity.value = props.enableOpacity ? 
                            (props.modelValue.opacity !== undefined ? props.modelValue.opacity : 1) : 
                            1;
      };
      
      // Open the panel
      const openPanelWrapper = () => {
        console.log('openPanelWrapper called');
        initFromModelValue();
        openPanel();
      };
      
      // Update color when the color input changes
      const updateColor = (newValue) => {
        tempColor.value = newValue;
      };
      
      // Apply selection and emit update
      const applySelection = () => {
        const result = {
          color: tempColor.value,
          opacity: props.enableOpacity ? tempOpacity.value : 1
        };
        emit('update:modelValue', result);
        panelOpen.value = false;
      };
      
      // Cancel and close
      const cancelSelection = () => {
        panelOpen.value = false;
      };
      
      // Clear selection and emit update
      const clearSelectionAndEmit = () => {
        tempColor.value = null;
        tempOpacity.value = 1;
        
        emit('update:modelValue', { color: null, opacity: 1 });
      };
      
      // Initialize from model value on component mount
      onMounted(() => {
        initFromModelValue();
      });
      
      // Watch for changes in the model value
      watch(() => props.modelValue, (newValue) => {
        initFromModelValue();
      }, { deep: true });
      
      return {
        // State
        panelOpen,
        displayMode,
        panelPosition,
        panelSize,
        tempColor,
        tempOpacity,
        
        // Computed
        hasColor,
        colorLabel,
        previewStyle,
        tempPreviewStyle,
        tempPreviewCombinedStyle,
        
        // Refs
        selectorContainer,
        backgroundPreview,
        
        // Methods
        openPanel,
        applySelection,
        cancelSelection,
        clearSelectionAndEmit,
        updateColor,
        updateDisplayMode,
        updatePanelPosition
      };
    }
  };
  </script>
  
  <style scoped>
  .solid-background-selector {
    position: relative;
    margin-bottom: 10px;
  }
  
  /* Background Preview Button */
  .background-preview-container {
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
  
  .background-preview-container:hover {
    border-color: #aaa;
  }
  
  /* Large size variant */
  .background-preview-container.large {
    padding: 12px 8px;
  }
  
  .background-preview {
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
  
  .background-preview-display {
    width: 100%;
    height: 100%;
  }
  
  .background-details {
    display: flex;
    flex-direction: column;
  }
  
  .background-name {
    font-weight: 500;
    margin-bottom: 2px;
  }
  
  .background-info {
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
  
  /* Color Panel Content */
  .color-panel-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    height: 100%;
    overflow-y: auto;
  }
  
  /* Background Preview in Editor */
  .background-preview-editor {
    width: 100%;
    margin-bottom: 20px;
  }
  
  .preview-display-large {
    width: 100%;
    height: 150px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  /* Background Parameters */
  .background-parameters {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .parameter-group {
    margin-bottom: 15px;
  }
  
  .parameter-group:last-child {
    margin-bottom: 0;
  }
  
  .parameter-group label {
    font-size: 14px;
    color: #444;
    margin-bottom: 8px;
    display: block;
  }
  
  .color-input-wrapper {
    margin-top: 8px;
  }
  
  /* Slider Styles */
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
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .preview-display-large {
      height: 120px;
    }
  }
  
  /* In the <style scoped> section, add a CSS rule to enlarge the main preview inside PanelPreviewWrapper:
     For example:

     .solid-background-selector .panel-preview-wrapper .preview {
       width: 120px;
       height: 120px;
     }
  */
  </style>
  