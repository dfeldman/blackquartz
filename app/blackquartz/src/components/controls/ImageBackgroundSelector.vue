<template>
    <div class="image-background-selector" ref="selectorContainer">
      <!-- Image Background Preview Button -->
      <PanelPreviewWrapper
        :label="label || 'Image Background'"
        :size="size"
        :previewStyle="previewStyle"
        :info="hasImage ? imageSourceLabel : ''"
        :clearEnabled="hasImage"
        @open="openPanel"
        @clear="clearSelectionAndEmit"
      />
      
      <!-- Image Background Panel using InputDetailComponent -->
      <InputDetailComponent
        v-if="panelOpen"
        :visible="panelOpen"
        :title="label || 'Image Background'"
        :display-mode="displayMode"
        :target-element="$refs.backgroundPreview"
        :position="panelPosition"
        :size="panelSize"
        @update:size="panelSize = $event"
        @close="cancelSelection"
        @apply="applySelection"
        @cancel="cancelSelection"
        @update:display-mode="updateDisplayMode"
        @update:position="updatePanelPosition"
      >
        <!-- Image Background Panel Content -->
        <div class="image-panel-content">
          <!-- Image Preview -->
          <div class="image-preview-editor">
            <div 
              class="preview-display-large" 
              :style="tempPreviewStyle"
            ></div>
          </div>
          
          <!-- Source Selection Tabs -->
          <div class="source-tabs">
            <button 
              class="source-tab" 
              :class="{ 'active': tempImageSource === 'url' }"
              @click="setImageSource('url')"
            >
              URL
            </button>
            <button 
              class="source-tab" 
              :class="{ 'active': tempImageSource === 'picsum' }"
              @click="setImageSource('picsum')"
            >
              Picsum Photos
            </button>
            <button 
              class="source-tab disabled" 
              title="Coming soon"
            >
              More Sources...
            </button>
          </div>
          
          <!-- Source Content -->
          <div class="source-content">
            <!-- URL Source -->
            <div v-if="tempImageSource === 'url'" class="url-source">
              <div class="url-input-container">
                <label>Image URL:</label>
                <input 
                  type="text" 
                  v-model="tempImageUrl" 
                  placeholder="https://example.com/image.jpg" 
                  class="url-input"
                  @input="updatePreview"
                />
              </div>
            </div>
            
            <!-- Picsum Source -->
            <div v-if="tempImageSource === 'picsum'" class="picsum-source">
              <PicsumImageSelector
                v-model="tempPicsumId"
                label="Stock Photo"
                :size="size"
                default-display-mode="panel"
                @update:modelValue="updatePreview"
              />
            </div>
          </div>
          
          <!-- Image Adjustments -->
          <div class="image-adjustments" v-if="hasImageSelected">
            <div class="parameter-group">
              <h5>Display Options</h5>
              
              <!-- Background Size -->
              <div class="parameter-row">
                <label>Background Size:</label>
                <select v-model="tempParams.size" @change="updatePreview" class="parameter-select">
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                  <option value="auto">Auto</option>
                  <option value="100% 100%">Stretch</option>
                  <option value="100% auto">100% Width</option>
                  <option value="auto 100%">100% Height</option>
                </select>
              </div>
              
              <!-- Background Position -->
              <div class="parameter-row">
                <label>Position:</label>
                <select v-model="tempParams.position" @change="updatePreview" class="parameter-select">
                  <option value="center">Center</option>
                  <option value="top">Top</option>
                  <option value="right">Right</option>
                  <option value="bottom">Bottom</option>
                  <option value="left">Left</option>
                  <option value="top left">Top Left</option>
                  <option value="top right">Top Right</option>
                  <option value="bottom left">Bottom Left</option>
                  <option value="bottom right">Bottom Right</option>
                </select>
              </div>
              
              <!-- Background Repeat -->
              <div class="parameter-row">
                <label>Repeat:</label>
                <select v-model="tempParams.repeat" @change="updatePreview" class="parameter-select">
                  <option value="no-repeat">No Repeat</option>
                  <option value="repeat">Repeat</option>
                  <option value="repeat-x">Repeat X</option>
                  <option value="repeat-y">Repeat Y</option>
                  <option value="space">Space</option>
                  <option value="round">Round</option>
                </select>
              </div>
              
              <!-- Background Attachment -->
              <div class="parameter-row">
                <label>Attachment:</label>
                <div class="attachment-options">
                  <button 
                    class="attachment-btn" 
                    :class="{ 'active': tempParams.attachment === 'scroll' }"
                    @click="setAttachmentMode('scroll')"
                  >
                    Scroll
                  </button>
                  <button 
                    class="attachment-btn" 
                    :class="{ 'active': tempParams.attachment === 'fixed' }"
                    @click="setAttachmentMode('fixed')"
                  >
                    Fixed
                  </button>
                </div>
              </div>
            </div>
            
            <div class="parameter-group">
              <h5>Adjustments</h5>
              
              <!-- Scale -->
              <div class="slider-parameter">
                <div class="slider-label">
                  <label>Scale:</label>
                  <span class="value-display">{{ Math.round(tempParams.scale * 100) }}%</span>
                </div>
                <div class="slider-container">
                  <input
                    type="range"
                    v-model.number="tempParams.scale"
                    min="0.1"
                    max="2"
                    step="0.05"
                    class="slider-input"
                    @input="updatePreview"
                  />
                </div>
              </div>
              
              <!-- Rotation -->
              <div class="slider-parameter">
                <div class="slider-label">
                  <label>Rotation:</label>
                  <span class="value-display">{{ tempParams.rotation }}°</span>
                </div>
                <div class="slider-container">
                  <input
                    type="range"
                    v-model.number="tempParams.rotation"
                    min="0"
                    max="360"
                    step="1"
                    class="slider-input"
                    @input="updatePreview"
                  />
                </div>
              </div>
              
              <!-- Opacity -->
              <div class="slider-parameter">
                <div class="slider-label">
                  <label>Opacity:</label>
                  <span class="value-display">{{ Math.round(tempParams.opacity * 100) }}%</span>
                </div>
                <div class="slider-container">
                  <input
                    type="range"
                    v-model.number="tempParams.opacity"
                    min="0.1"
                    max="1"
                    step="0.05"
                    class="slider-input"
                    @input="updatePreview"
                  />
                </div>
              </div>
            </div>
            
            <div class="parameter-group">
              <h5>Color Adjustments</h5>
              
              <!-- Hue Rotation -->
              <div class="slider-parameter">
                <div class="slider-label">
                  <label>Hue Rotation:</label>
                  <span class="value-display">{{ tempParams.hueRotate }}°</span>
                </div>
                <div class="slider-container">
                  <input
                    type="range"
                    v-model.number="tempParams.hueRotate"
                    min="0"
                    max="360"
                    step="1"
                    class="slider-input"
                    @input="updatePreview"
                  />
                </div>
              </div>
              
              <!-- Saturation -->
              <div class="slider-parameter">
                <div class="slider-label">
                  <label>Saturation:</label>
                  <span class="value-display">{{ tempParams.saturate }}%</span>
                </div>
                <div class="slider-container">
                  <input
                    type="range"
                    v-model.number="tempParams.saturate"
                    min="0"
                    max="200"
                    step="1"
                    class="slider-input"
                    @input="updatePreview"
                  />
                </div>
              </div>
              
              <!-- Brightness -->
              <div class="slider-parameter">
                <div class="slider-label">
                  <label>Brightness:</label>
                  <span class="value-display">{{ tempParams.brightness }}%</span>
                </div>
                <div class="slider-container">
                  <input
                    type="range"
                    v-model.number="tempParams.brightness"
                    min="0"
                    max="200"
                    step="1"
                    class="slider-input"
                    @input="updatePreview"
                  />
                </div>
              </div>
              
              <!-- Contrast -->
              <div class="slider-parameter">
                <div class="slider-label">
                  <label>Contrast:</label>
                  <span class="value-display">{{ tempParams.contrast }}%</span>
                </div>
                <div class="slider-container">
                  <input
                    type="range"
                    v-model.number="tempParams.contrast"
                    min="0"
                    max="200"
                    step="1"
                    class="slider-input"
                    @input="updatePreview"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </InputDetailComponent>
    </div>
  </template>
  
  <script>
  import { ref, computed, reactive, onMounted, watch } from 'vue';
  import InputDetailComponent from './InputDetailComponent.vue';
  import PicsumImageSelector from './PicsumImageSelector.vue';
  import { usePanel } from '../../composables/usePanel';
  import PanelPreviewWrapper from '../common/PanelPreviewWrapper.vue';
  
  export default {
    name: 'ImageBackgroundSelector',
    components: {
      InputDetailComponent,
      PicsumImageSelector,
      PanelPreviewWrapper
    },
    props: {
      modelValue: { 
        type: Object, 
        default: () => ({ 
          source: null, 
          imageUrl: '',
          picsumId: '',
          params: {
            size: 'cover',
            position: 'center',
            repeat: 'no-repeat',
            attachment: 'scroll',
            scale: 1,
            rotation: 0,
            opacity: 1,
            hueRotate: 0,
            saturate: 100,
            brightness: 100,
            contrast: 100
          }
        })
      },
      label: String,
      size: { type: String, default: 'regular' }, // 'regular' or 'large'
      defaultDisplayMode: { type: String, default: 'popup' }, // 'popup', 'modal', 'tearoff', 'panel'
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      // Use the composable
      const { panelOpen, displayMode, panelPosition, panelSize, openPanel, updateDisplayMode, updatePanelPosition } = usePanel(props.defaultDisplayMode, { width: '800px', height: '700px' });
      
      // DOM references
      const selectorContainer = ref(null);
      const backgroundPreview = ref(null);
      
      // Image source state
      const tempImageSource = ref(null);
      const tempImageUrl = ref('');
      const tempPicsumId = ref('');
      
      // Image params state with default values
      const tempParams = ref({
        size: 'cover',
        position: 'center',
        repeat: 'no-repeat',
        attachment: 'scroll',
        scale: 1,
        rotation: 0,
        opacity: 1,
        hueRotate: 0,
        saturate: 100,
        brightness: 100,
        contrast: 100
      });
      
      // Check if an image is currently selected
      const hasImage = computed(() => {
        return !!props.modelValue.source;
      });
      
      // Check if a temporary image is selected in the panel
      const hasImageSelected = computed(() => {
        if (tempImageSource.value === 'url') {
          return !!tempImageUrl.value;
        } else if (tempImageSource.value === 'picsum') {
          return !!tempPicsumId.value;
        }
        return false;
      });
      
      // Label for the selected image source
      const imageSourceLabel = computed(() => {
        if (props.modelValue.source === 'url') {
          // Abbreviate the URL if it's too long
          const url = props.modelValue.imageUrl;
          return url.length > 30 ? `URL: ${url.substring(0, 27)}...` : `URL: ${url}`;
        } else if (props.modelValue.source === 'picsum') {
          return `Picsum Photo ID: ${props.modelValue.picsumId}`;
        }
        return '';
      });
      
      // Generate CSS styles for the preview
      const getPreviewStyle = (source, imageUrl, picsumId, params) => {
        let backgroundImage = '';
        
        if (source === 'url' && imageUrl) {
          backgroundImage = `url('${imageUrl}')`;
        } else if (source === 'picsum' && picsumId) {
          // Use a larger size for the preview
          backgroundImage = `url('https://picsum.photos/id/${picsumId}/800/600')`;
        } else {
          return { backgroundColor: '#f0f0f0' }; // Placeholder background
        }
        
        // CSS filters for image adjustments
        const filters = [];
        if (params.hueRotate !== 0) filters.push(`hue-rotate(${params.hueRotate}deg)`);
        if (params.saturate !== 100) filters.push(`saturate(${params.saturate}%)`);
        if (params.brightness !== 100) filters.push(`brightness(${params.brightness}%)`);
        if (params.contrast !== 100) filters.push(`contrast(${params.contrast}%)`);
        
        const filterStyle = filters.length > 0 ? filters.join(' ') : 'none';
        
        // Transform for scale and rotation
        const transform = [];
        if (params.scale !== 1) transform.push(`scale(${params.scale})`);
        if (params.rotation !== 0) transform.push(`rotate(${params.rotation}deg)`);
        
        const transformStyle = transform.length > 0 ? transform.join(' ') : 'none';
        
        return {
          backgroundImage,
          backgroundSize: params.size,
          backgroundPosition: params.position,
          backgroundRepeat: params.repeat,
          backgroundAttachment: params.attachment,
          filter: filterStyle,
          transform: transformStyle,
          opacity: params.opacity,
          transformOrigin: 'center center'
        };
      };
      
      // Computed styles for the main preview
      const previewStyle = computed(() => {
        return getPreviewStyle(
          props.modelValue.source,
          props.modelValue.imageUrl,
          props.modelValue.picsumId,
          props.modelValue.params
        );
      });
      
      // Computed styles for the temporary preview in the panel
      const tempPreviewStyle = computed(() => {
        return getPreviewStyle(
          tempImageSource.value,
          tempImageUrl.value,
          tempPicsumId.value,
          tempParams.value
        );
      });
      
      // Initialize from model value
      const initFromModelValue = () => {
        tempImageSource.value = props.modelValue.source || null;
        tempImageUrl.value = props.modelValue.imageUrl || '';
        tempPicsumId.value = props.modelValue.picsumId || '';
        
        // Initialize parameters or use defaults
        tempParams.value = { 
          ...{
            size: 'cover',
            position: 'center',
            repeat: 'no-repeat',
            attachment: 'scroll',
            scale: 1,
            rotation: 0,
            opacity: 1,
            hueRotate: 0,
            saturate: 100,
            brightness: 100,
            contrast: 100
          },
          ...props.modelValue.params 
        };
      };
      
      // Wrap openPanel to call initFromModelValue first
      const openPanelWrapper = () => {
        initFromModelValue();
        openPanel();
      };
      
      // Set the image source type (url or picsum)
      const setImageSource = (source) => {
        tempImageSource.value = source;
      };
      
      // Set attachment mode (fixed or scroll)
      const setAttachmentMode = (mode) => {
        tempParams.value.attachment = mode;
        updatePreview();
      };
      
      // Update the preview when parameters change
      const updatePreview = () => {
        // No special handling needed, reactive properties will update automatically
      };
      
      // Apply selection and emit update
      const applySelection = () => {
        const result = {
          type: 'image',
          value: {
            source: tempImageSource.value,
            imageUrl: tempImageUrl.value,
            picsumId: tempPicsumId.value,
            params: { ...tempParams.value }
          }
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
        const result = {
          source: null,
          imageUrl: '',
          picsumId: '',
          params: {
            size: 'cover',
            position: 'center',
            repeat: 'no-repeat',
            attachment: 'scroll',
            scale: 1,
            rotation: 0,
            opacity: 1,
            hueRotate: 0,
            saturate: 100,
            brightness: 100,
            contrast: 100
          }
        };
        
        emit('update:modelValue', result);
      };
      
      // Initialize on component mount
      onMounted(() => {
        initFromModelValue();
      });
      
      // Watch for external model value changes
      watch(() => props.modelValue, (newValue) => {
        if (panelOpen.value) return; // Don't update while panel is open
        initFromModelValue();
      }, { deep: true });
      
      return {
        // State
        panelOpen,
        displayMode,
        panelPosition,
        panelSize,
        tempImageSource,
        tempImageUrl,
        tempPicsumId,
        tempParams,
        
        // Computed
        hasImage,
        hasImageSelected,
        imageSourceLabel,
        previewStyle,
        tempPreviewStyle,
        
        // Refs
        selectorContainer,
        backgroundPreview,
        
        // Methods
        openPanel: openPanelWrapper,
        setImageSource,
        setAttachmentMode,
        updatePreview,
        applySelection,
        cancelSelection,
        clearSelectionAndEmit
      };
    }
  };
  </script>
  
  <style scoped>
  .image-background-selector {
    position: relative;
    margin-bottom: 10px;
  }
  
  /* Image Panel Content */
  .image-panel-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    height: 100%;
    overflow-y: auto;
  }
  
  /* Image Preview in Panel */
  .image-preview-editor {
    width: 100%;
    margin-bottom: 10px;
  }
  
  .preview-display-large {
    width: 100%;
    height: 200px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background-color: #f0f0f0;
    background-size: cover;
    background-position: center;
  }
  
  /* Source Tabs */
  .source-tabs {
    display: flex;
    gap: 2px;
    border-bottom: 1px solid #ddd;
    margin-bottom: 20px;
  }
  
  .source-tab {
    padding: 10px 15px;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    border-bottom: none;
    border-radius: 4px 4px 0 0;
    cursor: pointer;
    font-size: 14px;
    color: #555;
    transition: all 0.2s;
  }
  
  .source-tab:hover:not(.disabled) {
    background-color: #e8e8e8;
  }
  
  .source-tab.active {
    background-color: white;
    border-bottom: 1px solid white;
    margin-bottom: -1px;
    color: #333;
    font-weight: 500;
  }
  
  .source-tab.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* Source Content */
  .source-content {
    margin-bottom: 20px;
  }
  
  /* URL Source */
  .url-input-container {
    margin-bottom: 20px;
  }
  
  .url-input-container label {
    display: block;
    font-size: 14px;
    color: #555;
    margin-bottom: 8px;
  }
  
  .url-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }
  
  /* Image Adjustments */
  .image-adjustments {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .parameter-group {
    margin-bottom: 20px;
    padding-bottom: 10px;
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
  
  /* Parameter rows */
  .parameter-row {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .parameter-row label {
    flex: 0 0 100px;
    font-size: 14px;
    color: #555;
  }
  
  .parameter-select {
    flex: 1;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    color: #333;
  }
  
  /* Slider Parameters */
  .slider-parameter {
    margin-bottom: 15px;
  }
  
  .slider-parameter:last-child {
    margin-bottom: 0;
  }
  
  .slider-label {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
  }
  
  .slider-label label {
    font-size: 14px;
    color: #555;
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
  
  /* Attachment Options */
  .attachment-options {
    display: flex;
    gap: 10px;
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
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .preview-display-large {
      height: 150px;
    }
    
    .parameter-row {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .parameter-row label {
      flex: 0 0 auto;
      margin-bottom: 5px;
    }
    
    .parameter-select {
      width: 100%;
    }
  }
  </style>