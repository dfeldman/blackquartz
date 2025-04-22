<template>
    <div class="spacing-editor" ref="spacingEditorContainer">
      <!-- Spacing Editor Preview Button -->
      <div 
        class="spacing-preview-container" 
        :class="{ 'large': size === 'large' }"
        @click="openPanel"
        ref="spacingPreview"
      >
        <div class="spacing-mini-preview">
          <div class="spacing-model-preview" :style="miniPreviewStyle">
            <div class="margin-box">
              <div class="border-box">
                <div class="padding-box">
                  <div class="content-box"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="spacing-details">
          <div class="spacing-name">{{ label || 'Padding & Margin' }}</div>
          <div class="spacing-info">
            {{ modeLabel }} · {{ getUnitLabels() }}
          </div>
        </div>
        <button 
          class="reset-spacing-btn" 
          @click.stop="resetAndEmit"
          title="Reset to defaults"
        >↺</button>
      </div>
      
      <!-- Spacing Editor Panel using InputDetailComponent -->
      <InputDetailComponent
        v-if="panelOpen"
        :visible="panelOpen"
        :title="label || 'Padding & Margin'"
        :display-mode="displayMode"
        :target-element="$refs.spacingPreview"
        :position="panelPosition"
        :size="panelSize"
        @update:size="panelSize = $event"
        @close="cancelSelection"
        @apply="applySelection"
        @cancel="cancelSelection"
        @update:display-mode="updateDisplayMode"
        @update:position="updatePanelPosition"
      >
        <!-- Spacing Editor Panel Content -->
        <div class="spacing-panel-content">
          <!-- Mode Selector -->
          <div class="mode-selector">
            <label>Edit Mode:</label>
            <div class="mode-buttons">
              <button 
                class="mode-button" 
                :class="{ 'active': tempMode === 'square' }"
                @click="setMode('square')"
                title="Same values for all sides"
              >
                <span class="mode-icon square-icon"></span>
                <span>Square</span>
              </button>
              <button 
                class="mode-button" 
                :class="{ 'active': tempMode === 'mirrored' }"
                @click="setMode('mirrored')"
                title="Horizontal/Vertical pairs"
              >
                <span class="mode-icon mirrored-icon"></span>
                <span>Mirrored</span>
              </button>
              <button 
                class="mode-button" 
                :class="{ 'active': tempMode === 'all' }"
                @click="setMode('all')"
                title="Individual values for each side"
              >
                <span class="mode-icon all-icon"></span>
                <span>All Sides</span>
              </button>
            </div>
          </div>
          
          <!-- Visual Preview -->
          <div class="spacing-visual-preview">
            <div class="model-preview" :style="previewStyle">
              <div class="margin-box">
                <div class="margin-label top">{{ getFormattedValue('margin', 'top') }}</div>
                <div class="margin-label right">{{ getFormattedValue('margin', 'right') }}</div>
                <div class="margin-label bottom">{{ getFormattedValue('margin', 'bottom') }}</div>
                <div class="margin-label left">{{ getFormattedValue('margin', 'left') }}</div>
                
                <div class="border-box">
                  <div class="padding-label top">{{ getFormattedValue('padding', 'top') }}</div>
                  <div class="padding-label right">{{ getFormattedValue('padding', 'right') }}</div>
                  <div class="padding-label bottom">{{ getFormattedValue('padding', 'bottom') }}</div>
                  <div class="padding-label left">{{ getFormattedValue('padding', 'left') }}</div>
                  
                  <div class="padding-box">
                    <div class="content-box">Content</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Padding Controls -->
          <div class="spacing-controls">
            <div class="control-section">
              <div class="section-header">
                <h5>Padding</h5>
                <div class="unit-selector">
                  <label>Unit:</label>
                  <select v-model="tempPadding.unit" @change="updatePreview">
                    <option value="px">px</option>
                    <option value="%">%</option>
                    <option value="em">em</option>
                    <option value="rem">rem</option>
                    <option value="vh">vh</option>
                    <option value="vw">vw</option>
                  </select>
                </div>
              </div>
              
              <!-- Square Mode (Single Value) -->
              <div class="value-inputs" v-if="tempMode === 'square'">
                <div class="input-group">
                  <label>All Sides:</label>
                  <div class="number-input">
                    <input 
                      type="number" 
                      v-model.number="tempPadding.top" 
                      min="0" 
                      step="1"
                      @input="syncSquareValues('padding'); updatePreview();"
                    />
                    <span class="unit-label">{{ tempPadding.unit }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Mirrored Mode (Vertical/Horizontal) -->
              <div class="value-inputs" v-if="tempMode === 'mirrored'">
                <div class="input-group">
                  <label>Vertical (Top/Bottom):</label>
                  <div class="number-input">
                    <input 
                      type="number" 
                      v-model.number="tempPadding.top" 
                      min="0" 
                      step="1"
                      @input="syncMirroredValues('padding', 'vertical'); updatePreview();"
                    />
                    <span class="unit-label">{{ tempPadding.unit }}</span>
                  </div>
                </div>
                <div class="input-group">
                  <label>Horizontal (Left/Right):</label>
                  <div class="number-input">
                    <input 
                      type="number" 
                      v-model.number="tempPadding.left" 
                      min="0" 
                      step="1"
                      @input="syncMirroredValues('padding', 'horizontal'); updatePreview();"
                    />
                    <span class="unit-label">{{ tempPadding.unit }}</span>
                  </div>
                </div>
              </div>
              
              <!-- All Sides Mode (Individual Values) -->
              <div class="value-inputs all-sides" v-if="tempMode === 'all'">
                <div class="input-group">
                  <label>Top:</label>
                  <div class="number-input">
                    <input 
                      type="number" 
                      v-model.number="tempPadding.top" 
                      min="0" 
                      step="1"
                      @input="updatePreview"
                    />
                    <span class="unit-label">{{ tempPadding.unit }}</span>
                  </div>
                </div>
                <div class="input-group">
                  <label>Right:</label>
                  <div class="number-input">
                    <input 
                      type="number" 
                      v-model.number="tempPadding.right" 
                      min="0" 
                      step="1"
                      @input="updatePreview"
                    />
                    <span class="unit-label">{{ tempPadding.unit }}</span>
                  </div>
                </div>
                <div class="input-group">
                  <label>Bottom:</label>
                  <div class="number-input">
                    <input 
                      type="number" 
                      v-model.number="tempPadding.bottom" 
                      min="0" 
                      step="1"
                      @input="updatePreview"
                    />
                    <span class="unit-label">{{ tempPadding.unit }}</span>
                  </div>
                </div>
                <div class="input-group">
                  <label>Left:</label>
                  <div class="number-input">
                    <input 
                      type="number" 
                      v-model.number="tempPadding.left" 
                      min="0" 
                      step="1"
                      @input="updatePreview"
                    />
                    <span class="unit-label">{{ tempPadding.unit }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Margin Controls -->
            <div class="control-section">
              <div class="section-header">
                <h5>Margin</h5>
                <div class="unit-selector">
                  <label>Unit:</label>
                  <select v-model="tempMargin.unit" @change="updatePreview">
                    <option value="px">px</option>
                    <option value="%">%</option>
                    <option value="em">em</option>
                    <option value="rem">rem</option>
                    <option value="vh">vh</option>
                    <option value="vw">vw</option>
                  </select>
                </div>
              </div>
              
              <!-- Square Mode (Single Value) -->
              <div class="value-inputs" v-if="tempMode === 'square'">
                <div class="input-group">
                  <label>All Sides:</label>
                  <div class="number-input">
                    <input 
                      type="number" 
                      v-model.number="tempMargin.top" 
                      min="0" 
                      step="1"
                      @input="syncSquareValues('margin'); updatePreview();"
                    />
                    <span class="unit-label">{{ tempMargin.unit }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Mirrored Mode (Vertical/Horizontal) -->
              <div class="value-inputs" v-if="tempMode === 'mirrored'">
                <div class="input-group">
                  <label>Vertical (Top/Bottom):</label>
                  <div class="number-input">
                    <input 
                      type="number" 
                      v-model.number="tempMargin.top" 
                      min="0" 
                      step="1"
                      @input="syncMirroredValues('margin', 'vertical'); updatePreview();"
                    />
                    <span class="unit-label">{{ tempMargin.unit }}</span>
                  </div>
                </div>
                <div class="input-group">
                  <label>Horizontal (Left/Right):</label>
                  <div class="number-input">
                    <input 
                      type="number" 
                      v-model.number="tempMargin.left" 
                      min="0" 
                      step="1"
                      @input="syncMirroredValues('margin', 'horizontal'); updatePreview();"
                    />
                    <span class="unit-label">{{ tempMargin.unit }}</span>
                  </div>
                </div>
              </div>
              
              <!-- All Sides Mode (Individual Values) -->
              <div class="value-inputs all-sides" v-if="tempMode === 'all'">
                <div class="input-group">
                  <label>Top:</label>
                  <div class="number-input">
                    <input 
                      type="number" 
                      v-model.number="tempMargin.top" 
                      min="0" 
                      step="1"
                      @input="updatePreview"
                    />
                    <span class="unit-label">{{ tempMargin.unit }}</span>
                  </div>
                </div>
                <div class="input-group">
                  <label>Right:</label>
                  <div class="number-input">
                    <input 
                      type="number" 
                      v-model.number="tempMargin.right" 
                      min="0" 
                      step="1"
                      @input="updatePreview"
                    />
                    <span class="unit-label">{{ tempMargin.unit }}</span>
                  </div>
                </div>
                <div class="input-group">
                  <label>Bottom:</label>
                  <div class="number-input">
                    <input 
                      type="number" 
                      v-model.number="tempMargin.bottom" 
                      min="0" 
                      step="1"
                      @input="updatePreview"
                    />
                    <span class="unit-label">{{ tempMargin.unit }}</span>
                  </div>
                </div>
                <div class="input-group">
                  <label>Left:</label>
                  <div class="number-input">
                    <input 
                      type="number" 
                      v-model.number="tempMargin.left" 
                      min="0" 
                      step="1"
                      @input="updatePreview"
                    />
                    <span class="unit-label">{{ tempMargin.unit }}</span>
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
  import { ref, computed, reactive, onMounted, watch } from 'vue';
  import InputDetailComponent from './InputDetailComponent.vue';
  import { usePanel } from '../../composables/usePanel';
  
  export default {
    name: 'SpacingEditor',
    components: {
      InputDetailComponent
    },
    props: {
      modelValue: { 
        type: Object, 
        default: () => ({ 
          mode: 'mirrored',
          padding: {
            unit: 'px',
            top: 16,
            right: 16,
            bottom: 16,
            left: 16
          },
          margin: {
            unit: 'px',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          }
        })
      },
      label: String,
      size: { type: String, default: 'regular' }, // 'regular' or 'large'
      defaultDisplayMode: { type: String, default: 'popup' }, // 'popup', 'modal', 'tearoff', 'panel'
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      // DOM references
      const spacingEditorContainer = ref(null);
      const spacingPreview = ref(null);
      
      // Temporary state for the panel
      const tempMode = ref('mirrored');
      const tempPadding = ref({
        unit: 'px',
        top: 16,
        right: 16,
        bottom: 16,
        left: 16
      });
      const tempMargin = ref({
        unit: 'px',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      });
      
      // Computed properties
      const modeLabel = computed(() => {
        switch (props.modelValue.mode) {
          case 'square': return 'Square';
          case 'mirrored': return 'Mirrored';
          case 'all': return 'All Sides';
          default: return 'Mirrored';
        }
      });
      
      // Computed styles for previews
      const miniPreviewStyle = computed(() => {
        // Create a simplified visual style for the mini preview
        // Scale down the values for a mini representation
        const scaling = 0.25;
        
        const pad = props.modelValue.padding ?? { top: 16, right: 16, bottom: 16, left: 16, unit: 'px' };
        const mar = props.modelValue.margin ?? { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' };
        
        const paddingTop = pad.top * scaling;
        const paddingRight = pad.right * scaling;
        const paddingBottom = pad.bottom * scaling;
        const paddingLeft = pad.left * scaling;
        
        const marginTop = mar.top * scaling;
        const marginRight = mar.right * scaling;
        const marginBottom = mar.bottom * scaling;
        const marginLeft = mar.left * scaling;
        
        return {
          '--padding-top': `${paddingTop}px`,
          '--padding-right': `${paddingRight}px`,
          '--padding-bottom': `${paddingBottom}px`,
          '--padding-left': `${paddingLeft}px`,
          '--margin-top': `${marginTop}px`,
          '--margin-right': `${marginRight}px`,
          '--margin-bottom': `${marginBottom}px`,
          '--margin-left': `${marginLeft}px`
        };
      });
      
      const previewStyle = computed(() => {
        // Create visual style variables for the detailed preview
        return {
          '--padding-top': `${tempPadding.value.top}${tempPadding.value.unit}`,
          '--padding-right': `${tempPadding.value.right}${tempPadding.value.unit}`,
          '--padding-bottom': `${tempPadding.value.bottom}${tempPadding.value.unit}`,
          '--padding-left': `${tempPadding.value.left}${tempPadding.value.unit}`,
          '--margin-top': `${tempMargin.value.top}${tempMargin.value.unit}`,
          '--margin-right': `${tempMargin.value.right}${tempMargin.value.unit}`,
          '--margin-bottom': `${tempMargin.value.bottom}${tempMargin.value.unit}`,
          '--margin-left': `${tempMargin.value.left}${tempMargin.value.unit}`
        };
      });
      
      // Methods
      const getUnitLabels = () => {
        const padUnit = props.modelValue.padding?.unit ?? 'px';
        const marUnit = props.modelValue.margin?.unit ?? 'px';
        return `Padding: ${padUnit}, Margin: ${marUnit}`;
      };
      
      const getFormattedValue = (type, side) => {
        const val = type === 'padding' ? tempPadding.value[side] : tempMargin.value[side];
        const unit = type === 'padding' ? tempPadding.value.unit : tempMargin.value.unit;
        return `${val}${unit}`;
      };
      
      // Initialize temporary values from model value
      const initFromModelValue = () => {
        tempMode.value = props.modelValue.mode || 'mirrored';
        
        tempPadding.value = {
          unit: props.modelValue.padding?.unit ?? 'px',
          top: props.modelValue.padding?.top ?? 0,
          right: props.modelValue.padding?.right ?? 0,
          bottom: props.modelValue.padding?.bottom ?? 0,
          left: props.modelValue.padding?.left ?? 0
        };
        
        tempMargin.value = {
          unit: props.modelValue.margin?.unit ?? 'px',
          top: props.modelValue.margin?.top ?? 0,
          right: props.modelValue.margin?.right ?? 0,
          bottom: props.modelValue.margin?.bottom ?? 0,
          left: props.modelValue.margin?.left ?? 0
        };
      };
      
      // Set the edit mode
      const setMode = (mode) => {
        tempMode.value = mode;
        
        // Adjust values based on the new mode
        if (mode === 'square') {
          // Use top value for all sides
          syncSquareValues('padding');
          syncSquareValues('margin');
        } else if (mode === 'mirrored') {
          // Use top value for top/bottom and left value for left/right
          syncMirroredValues('padding', 'vertical');
          syncMirroredValues('padding', 'horizontal');
          syncMirroredValues('margin', 'vertical');
          syncMirroredValues('margin', 'horizontal');
        }
        
        updatePreview();
      };
      
      // Sync values in square mode
      const syncSquareValues = (type) => {
        const value = type === 'padding' ? tempPadding.value.top : tempMargin.value.top;
        
        if (type === 'padding') {
          tempPadding.value.right = value;
          tempPadding.value.bottom = value;
          tempPadding.value.left = value;
        } else {
          tempMargin.value.right = value;
          tempMargin.value.bottom = value;
          tempMargin.value.left = value;
        }
      };
      
      // Sync values in mirrored mode
      const syncMirroredValues = (type, direction) => {
        if (type === 'padding') {
          if (direction === 'vertical') {
            tempPadding.value.bottom = tempPadding.value.top;
          } else {
            tempPadding.value.right = tempPadding.value.left;
          }
        } else {
          if (direction === 'vertical') {
            tempMargin.value.bottom = tempMargin.value.top;
          } else {
            tempMargin.value.right = tempMargin.value.left;
          }
        }
      };
      
      // Update preview (nothing needed here as it's reactive)
      const updatePreview = () => {
        // This can be left empty as Vue's reactivity will update the computed properties
        // But we include it to be called after input changes
      };
      
      // Use the composable
      const { panelOpen, displayMode, panelPosition, panelSize, openPanel, updateDisplayMode, updatePanelPosition } = usePanel(props.defaultDisplayMode, { width: '500px', height: '600px' });
      
      const openPanelWrapper = () => {
        initFromModelValue();
        openPanel();
      };
      
      // Apply selection and emit update
      const applySelection = () => {
        const result = {
          mode: tempMode.value,
          padding: { ...tempPadding.value },
          margin: { ...tempMargin.value }
        };
        
        emit('update:modelValue', result);
        panelOpen.value = false;
      };
      
      // Cancel and close
      const cancelSelection = () => {
        panelOpen.value = false;
      };
      
      // Reset to defaults and emit
      const resetAndEmit = () => {
        const defaults = {
          mode: 'mirrored',
          padding: {
            unit: 'px',
            top: 16,
            right: 16,
            bottom: 16,
            left: 16
          },
          margin: {
            unit: 'px',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          }
        };
        
        emit('update:modelValue', defaults);
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
        tempMode,
        tempPadding,
        tempMargin,
        
        // Computed
        modeLabel,
        miniPreviewStyle,
        previewStyle,
        
        // Refs
        spacingEditorContainer,
        spacingPreview,
        
        // Methods
        getUnitLabels,
        getFormattedValue,
        updateDisplayMode,
        updatePanelPosition,
        openPanel: openPanelWrapper,
        setMode,
        syncSquareValues,
        syncMirroredValues,
        updatePreview,
        applySelection,
        cancelSelection,
        resetAndEmit
      };
    }
  };
  </script>
  
  <style scoped>
  .spacing-editor {
    position: relative;
    margin-bottom: 10px;
  }
  
  /* Spacing Preview Button */
  .spacing-preview-container {
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
  
  .spacing-preview-container:hover {
    border-color: #aaa;
  }
  
  /* Large size variant */
  .spacing-preview-container.large {
    padding: 12px 8px;
  }
  
  .spacing-mini-preview {
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
  
  .spacing-details {
    display: flex;
    flex-direction: column;
  }
  
  .spacing-name {
    font-weight: 500;
    margin-bottom: 2px;
  }
  
  .spacing-info {
    font-size: 12px;
    color: #666;
  }
  
  /* Reset button */
  .reset-spacing-btn {
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
  
  .reset-spacing-btn:hover {
    background-color: #f0f0f0;
    color: #555;
  }
  
  /* Spacing Panel Content */
  .spacing-panel-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    height: 100%;
    overflow-y: auto;
  }
  
  /* Mode Selector */
  .mode-selector {
    margin-bottom: 20px;
  }
  
  .mode-selector label {
    display: block;
    font-size: 14px;
    color: #555;
    margin-bottom: 10px;
  }
  
  .mode-buttons {
    display: flex;
    gap: 10px;
  }
  
  .mode-button {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: #f5f5f5;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }
  
  .mode-button:hover {
    background-color: #e8e8e8;
    border-color: #ccc;
  }
  
  .mode-button.active {
    background-color: #e0f0ff;
    border-color: #4a8bf5;
    color: #4a8bf5;
  }
  
  .mode-icon {
    width: 24px;
    height: 24px;
    display: block;
    background-color: #bbb;
    border-radius: 3px;
  }
  
  .mode-button.active .mode-icon {
    background-color: #4a8bf5;
  }
  
  .square-icon {
    clip-path: inset(15% 15% 15% 15%);
  }
  
  .mirrored-icon {
    clip-path: inset(25% 15% 25% 15%);
  }
  
  .all-icon {
    position: relative;
  }
  
  .all-icon::before,
  .all-icon::after {
    content: "";
    position: absolute;
    background-color: white;
    top: 25%;
    left: 25%;
    width: 50%;
    height: 50%;
    border-radius: 2px;
  }
  
  /* Spacing Visual Preview */
  .spacing-visual-preview {
    width: 100%;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }
  
  .model-preview {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .margin-box {
    position: relative;
    background-color: #ffd7d7;
    margin-top: var(--margin-top);
    margin-right: var(--margin-right);
    margin-bottom: var(--margin-bottom);
    margin-left: var(--margin-left);
    width: calc(100% - var(--margin-left) - var(--margin-right));
    height: calc(100% - var(--margin-top) - var(--margin-bottom));
    min-width: 50px;
    min-height: 50px;
  }
  
  .border-box {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: #d7d7ff;
    border: 2px solid #9595ff;
  }
  
  .padding-box {
    position: relative;
    background-color: #d7ffd7;
    padding-top: var(--padding-top);
    padding-right: var(--padding-right);
    padding-bottom: var(--padding-bottom);
    padding-left: var(--padding-left);
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }
  
  .content-box {
    width: 100%;
    height: 100%;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #555;
  }
  
  /* Mini preview model */
  .spacing-model-preview {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .spacing-model-preview .margin-box {
    margin-top: var(--margin-top);
    margin-right: var(--margin-right);
    margin-bottom: var(--margin-bottom);
    margin-left: var(--margin-left);
    width: calc(100% - var(--margin-left) - var(--margin-right));
    height: calc(100% - var(--margin-top) - var(--margin-bottom));
    min-width: 10px;
    min-height: 10px;
  }
  
  .spacing-model-preview .padding-box {
    padding-top: var(--padding-top);
    padding-right: var(--padding-right);
    padding-bottom: var(--padding-bottom);
    padding-left: var(--padding-left);
  }
  
  /* Value labels in the preview */
  .margin-label,
  .padding-label {
    position: absolute;
    font-size: 10px;
    color: #777;
    pointer-events: none;
  }
  
  .margin-label.top {
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .margin-label.right {
    top: 50%;
    right: -25px;
    transform: translateY(-50%);
  }
  
  .margin-label.bottom {
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .margin-label.left {
    top: 50%;
    left: -25px;
    transform: translateY(-50%);
  }
  
  .padding-label.top {
    top: 5px;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .padding-label.right {
    top: 50%;
    right: 5px;
    transform: translateY(-50%);
  }
  
  .padding-label.bottom {
    bottom: 5px;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .padding-label.left {
    top: 50%;
    left: 5px;
    transform: translateY(-50%);
  }
  
  /* Spacing Controls */
  .spacing-controls {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }
  
  .control-section {
    margin-bottom: 20px;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .section-header h5 {
    margin: 0;
    font-size: 16px;
    color: #555;
  }
  
  .unit-selector {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  
  .unit-selector label {
    font-size: 12px;
    color: #777;
  }
  
  .unit-selector select {
    padding: 4px 6px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 12px;
  }
  
  /* Value Inputs */
  .value-inputs {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .value-inputs.all-sides {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px 20px;
  }
  
  .input-group {
    display: flex;
    align-items: center;
  }
  
  .input-group label {
    flex: 0 0 140px;
    font-size: 14px;
    color: #555;
  }
  
  .number-input {
    position: relative;
    flex: 1;
  }
  
  .number-input input {
    width: 100%;
    padding: 8px 30px 8px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .unit-label {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 12px;
    color: #777;
    pointer-events: none;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .value-inputs.all-sides {
      grid-template-columns: 1fr;
    }
    
    .input-group {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .input-group label {
      flex: 0 0 auto;
      margin-bottom: 5px;
    }
    
    .number-input {
      width: 100%;
    }
  }
  </style>