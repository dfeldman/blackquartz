<template>
  <div class="themed-gradient-input" ref="gradientInputContainer">
    <!-- Gradient Preview Button -->
    <div 
      class="gradient-preview-container" 
      :class="{ 'large': size === 'large' }"
      @click="openPanel"
      ref="gradientPreview"
    >
      <div class="gradient-preview">
        <div class="gradient-preview-light" :style="{ background: previewLightGradient }">
          <span class="mode-indicator">☀️</span>
        </div>
        <div class="gradient-preview-dark" :style="{ background: previewDarkGradient }">
          <span class="mode-indicator">🌙</span>
        </div>
      </div>
      <div v-if="label" class="gradient-preview-label">{{ label }}</div>
    </div>
    
    <!-- Gradient Panel using InputDetailComponent -->
    <InputDetailComponent
      v-if="panelOpen"
      :visible="panelOpen"
      :title="label || 'Create Gradient'"
      :display-mode="displayMode"
      :target-element="$refs.gradientPreview"
      :position="panelPosition"
      :size="panelSize"
      @update:size="panelSize = $event"
      @close="cancelSelection"
      @apply="applySelection"
      @cancel="cancelSelection" 
      @update:display-mode="(mode) => { console.log('Mode changed to:', mode); displayMode = mode; }"
      @update:position="updatePanelPosition"
      :can-tear-off="true"
      :display-mode-controls="true"
      :debug="true"
    >
      <!-- Gradient Panel Content -->
      <div class="gradient-panel-content">
        <!-- Light Mode Section -->
        <div class="mode-section">
          <h4><span class="mode-icon">☀️</span> Light Mode</h4>
          
          <!-- Gradient Preview -->
          <div 
            class="gradient-large-preview" 
            :style="{ background: tempGradients.light.cssString }"
          ></div>
          
          <!-- Gradient Type Controls -->
          <div class="gradient-type-controls">
            <div class="radio-group">
              <label class="radio-label">
                <input 
                  type="radio" 
                  v-model="tempGradients.light.type" 
                  value="linear" 
                  @change="updateGradient('light')"
                >
                <span>Linear</span>
              </label>
              <label class="radio-label">
                <input 
                  type="radio" 
                  v-model="tempGradients.light.type" 
                  value="radial" 
                  @change="updateGradient('light')"
                >
                <span>Radial</span>
              </label>
            </div>
            
            <!-- Angle control for linear gradient -->
            <div v-if="tempGradients.light.type === 'linear'" class="angle-control">
              <label>Angle</label>
              <div class="slider-container">
                <input 
                  type="range" 
                  v-model.number="tempGradients.light.angle" 
                  min="0" 
                  max="359" 
                  step="1" 
                  @input="updateGradient('light')"
                >
                <input 
                  type="number" 
                  v-model.number="tempGradients.light.angle" 
                  min="0" 
                  max="359" 
                  @input="updateGradient('light')"
                  class="angle-input"
                >
              </div>
            </div>
            
            <!-- Position control for radial gradient -->
            <div v-if="tempGradients.light.type === 'radial'" class="position-control">
              <label>Position</label>
              <div class="position-inputs">
                <div class="position-input-group">
                  <label>X</label>
                  <input 
                    type="number" 
                    v-model.number="tempGradients.light.position.x" 
                    min="0" 
                    max="100" 
                    step="1" 
                    @input="updateGradient('light')"
                  >
                  <span>%</span>
                </div>
                <div class="position-input-group">
                  <label>Y</label>
                  <input 
                    type="number" 
                    v-model.number="tempGradients.light.position.y" 
                    min="0" 
                    max="100" 
                    step="1" 
                    @input="updateGradient('light')"
                  >
                  <span>%</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Color Stops -->
          <div class="color-stops-section">
            <h5>Color Stops</h5>
            <div class="color-stops-preview">
              <div 
                class="color-stops-bar" 
                :style="{ background: tempGradients.light.cssString }"
              ></div>
              <div class="color-stops-markers">
                <div 
                  v-for="(stop, index) in tempGradients.light.stops" 
                  :key="`light-stop-${index}`"
                  class="color-stop-marker"
                  :style="{ 
                    left: `${stop.position}%`, 
                    backgroundColor: stop.color
                  }"
                  @mousedown="startDragStop('light', index, $event)"
                  :class="{ 'active': activeStop.light === index }"
                  @click.stop="selectStop('light', index)"
                ></div>
              </div>
            </div>
            
            <!-- Selected Stop Controls -->
            <div v-if="activeStop.light !== null" class="stop-controls">
              <div class="stop-color-container">
                <div class="color-input-container">
                  <input 
                    type="color" 
                    v-model="tempGradients.light.stops[activeStop.light].color" 
                    @input="updateGradient('light')"
                    class="color-input"
                  >
                  <div 
                    class="color-preview" 
                    :style="{ backgroundColor: tempGradients.light.stops[activeStop.light].color }"
                  ></div>
                </div>
                <input 
                  type="text" 
                  v-model="tempGradients.light.stops[activeStop.light].color" 
                  @input="updateGradient('light')"
                  class="hex-input"
                  maxlength="7"
                  placeholder="#RRGGBB"
                >
                <div class="stop-position-control">
                  <label>Position</label>
                  <input 
                    type="number" 
                    v-model.number="tempGradients.light.stops[activeStop.light].position" 
                    min="0" 
                    max="100" 
                    step="1" 
                    @input="updateGradient('light')"
                    class="position-input"
                  >
                  <span>%</span>
                </div>
              </div>
              <div class="stop-actions">
                <button 
                  class="btn btn-small remove-stop" 
                  @click="removeStop('light', activeStop.light)"
                  :disabled="tempGradients.light.stops.length <= 2"
                >
                  Remove
                </button>
              </div>
            </div>
            
            <div class="stop-buttons">
              <button class="btn add-stop" @click="addStop('light')">Add Color Stop</button>
            </div>
          </div>
          
          <!-- Gradient Presets -->
          <div class="gradient-presets">
            <h5>Presets</h5>
            <div class="presets-grid">
              <button 
                v-for="(preset, index) in presets" 
                :key="`light-preset-${index}`"
                class="preset-btn"
                :style="{ background: preset.light }"
                @click="applyPreset('light', index)"
              ></button>
            </div>
          </div>
          
          <button 
            class="link-gradients-btn" 
            :class="{ 'linked': gradientsLinked }" 
            @click="toggleGradientLink" 
            title="Mirror gradient to dark mode"
          >
            <span class="link-icon">🔗</span> {{ gradientsLinked ? 'Gradients Linked' : 'Link Gradients' }}
          </button>
        </div>
        
        <!-- Dark Mode Section -->
        <div class="mode-section">
          <h4><span class="mode-icon">🌙</span> Dark Mode</h4>
          
          <!-- Gradient Preview -->
          <div 
            class="gradient-large-preview" 
            :style="{ background: tempGradients.dark.cssString }"
          ></div>
          
          <!-- Gradient Type Controls -->
          <div class="gradient-type-controls" :class="{ 'disabled': gradientsLinked }">
            <div class="radio-group">
              <label class="radio-label">
                <input 
                  type="radio" 
                  v-model="tempGradients.dark.type" 
                  value="linear" 
                  @change="updateGradient('dark')"
                  :disabled="gradientsLinked"
                >
                <span>Linear</span>
              </label>
              <label class="radio-label">
                <input 
                  type="radio" 
                  v-model="tempGradients.dark.type" 
                  value="radial" 
                  @change="updateGradient('dark')"
                  :disabled="gradientsLinked"
                >
                <span>Radial</span>
              </label>
            </div>
            
            <!-- Angle control for linear gradient -->
            <div v-if="tempGradients.dark.type === 'linear'" class="angle-control">
              <label>Angle</label>
              <div class="slider-container">
                <input 
                  type="range" 
                  v-model.number="tempGradients.dark.angle" 
                  min="0" 
                  max="359" 
                  step="1" 
                  @input="updateGradient('dark')"
                  :disabled="gradientsLinked"
                >
                <input 
                  type="number" 
                  v-model.number="tempGradients.dark.angle" 
                  min="0" 
                  max="359" 
                  @input="updateGradient('dark')"
                  class="angle-input"
                  :disabled="gradientsLinked"
                >
              </div>
            </div>
            
            <!-- Position control for radial gradient -->
            <div v-if="tempGradients.dark.type === 'radial'" class="position-control">
              <label>Position</label>
              <div class="position-inputs">
                <div class="position-input-group">
                  <label>X</label>
                  <input 
                    type="number" 
                    v-model.number="tempGradients.dark.position.x" 
                    min="0" 
                    max="100" 
                    step="1" 
                    @input="updateGradient('dark')"
                    :disabled="gradientsLinked"
                  >
                  <span>%</span>
                </div>
                <div class="position-input-group">
                  <label>Y</label>
                  <input 
                    type="number" 
                    v-model.number="tempGradients.dark.position.y" 
                    min="0" 
                    max="100" 
                    step="1" 
                    @input="updateGradient('dark')"
                    :disabled="gradientsLinked"
                  >
                  <span>%</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Color Stops -->
          <div class="color-stops-section" :class="{ 'disabled': gradientsLinked }">
            <h5>Color Stops</h5>
            <div class="color-stops-preview">
              <div 
                class="color-stops-bar" 
                :style="{ background: tempGradients.dark.cssString }"
              ></div>
              <div class="color-stops-markers">
                <div 
                  v-for="(stop, index) in tempGradients.dark.stops" 
                  :key="`dark-stop-${index}`"
                  class="color-stop-marker"
                  :style="{ 
                    left: `${stop.position}%`, 
                    backgroundColor: stop.color
                  }"
                  @mousedown="startDragStop('dark', index, $event)"
                  :class="{ 'active': activeStop.dark === index }"
                  @click.stop="selectStop('dark', index)"
                  :disabled="gradientsLinked"
                ></div>
              </div>
            </div>
            
            <!-- Selected Stop Controls -->
            <div v-if="activeStop.dark !== null && !gradientsLinked" class="stop-controls">
              <div class="stop-color-container">
                <div class="color-input-container">
                  <input 
                    type="color" 
                    v-model="tempGradients.dark.stops[activeStop.dark].color" 
                    @input="updateGradient('dark')"
                    class="color-input"
                    :disabled="gradientsLinked"
                  >
                  <div 
                    class="color-preview" 
                    :style="{ backgroundColor: tempGradients.dark.stops[activeStop.dark].color }"
                  ></div>
                </div>
                <input 
                  type="text" 
                  v-model="tempGradients.dark.stops[activeStop.dark].color" 
                  @input="updateGradient('dark')"
                  class="hex-input"
                  maxlength="7"
                  placeholder="#RRGGBB"
                  :disabled="gradientsLinked"
                >
                <div class="stop-position-control">
                  <label>Position</label>
                  <input 
                    type="number" 
                    v-model.number="tempGradients.dark.stops[activeStop.dark].position" 
                    min="0" 
                    max="100" 
                    step="1" 
                    @input="updateGradient('dark')"
                    class="position-input"
                    :disabled="gradientsLinked"
                  >
                  <span>%</span>
                </div>
              </div>
              <div class="stop-actions">
                <button 
                  class="btn btn-small remove-stop" 
                  @click="removeStop('dark', activeStop.dark)"
                  :disabled="tempGradients.dark.stops.length <= 2 || gradientsLinked"
                >
                  Remove
                </button>
              </div>
            </div>
            
            <div class="stop-buttons">
              <button 
                class="btn add-stop" 
                @click="addStop('dark')"
                :disabled="gradientsLinked"
              >
                Add Color Stop
              </button>
            </div>
          </div>
          
          <!-- Gradient Presets -->
          <div class="gradient-presets" :class="{ 'disabled': gradientsLinked }">
            <h5>Presets</h5>
            <div class="presets-grid">
              <button 
                v-for="(preset, index) in presets" 
                :key="`dark-preset-${index}`"
                class="preset-btn"
                :style="{ background: preset.dark }"
                @click="applyPreset('dark', index)"
                :disabled="gradientsLinked"
              ></button>
            </div>
          </div>
        </div>
      </div>
    </InputDetailComponent>
  </div>
</template>

<script>
import InputDetailComponent from './InputDetailComponent.vue';

export default {
  name: 'ThemedGradientInput',
  components: {
    InputDetailComponent
  },
  props: {
    modelValue: { required: true },
    label: String,
    theme: { type: Object, default: () => ({}) },
    size: { type: String, default: 'regular' }, // 'regular' or 'large'
    defaultDisplayMode: { type: String, default: 'popup' } // 'popup', 'modal', 'tearoff', 'panel'
  },
  emits: ['update:modelValue'],
  data() {
    return {
      panelOpen: false,
      gradientsLinked: true,
      lastModelValue: null, // Track last model value to prevent recursive updates
      isUpdating: false, // Flag to prevent recursive updates
      cachedLightGradient: null, // Cache for light gradient string
      cachedInverseLightGradient: null, // Cache for inverted dark gradient
      
      // Panel state for InputDetailComponent
      displayMode: 'popup', // Start with popup, will be updated with defaultDisplayMode in mounted
      panelPosition: { top: '0px', left: '0px' },
      panelSize: { width: '850px', height: '800px' },
      
      tempGradients: {
        light: {
          type: 'linear',
          angle: 90,
          position: { x: 50, y: 50 },
          stops: [
            { color: '#FFFFFF', position: 0 },
            { color: '#0066FF', position: 100 }
          ],
          cssString: 'linear-gradient(90deg, #FFFFFF 0%, #0066FF 100%)'
        },
        dark: {
          type: 'linear',
          angle: 90,
          position: { x: 50, y: 50 },
          stops: [
            { color: '#000000', position: 0 },
            { color: '#3399FF', position: 100 }
          ],
          cssString: 'linear-gradient(90deg, #000000 0%, #3399FF 100%)'
        }
      },
      originalGradients: {
        light: {
          type: 'linear',
          angle: 90,
          position: { x: 50, y: 50 },
          stops: [
            { color: '#FFFFFF', position: 0 },
            { color: '#0066FF', position: 100 }
          ],
          cssString: 'linear-gradient(90deg, #FFFFFF 0%, #0066FF 100%)'
        },
        dark: {
          type: 'linear',
          angle: 90,
          position: { x: 50, y: 50 },
          stops: [
            { color: '#000000', position: 0 },
            { color: '#3399FF', position: 100 }
          ],
          cssString: 'linear-gradient(90deg, #000000 0%, #3399FF 100%)'
        }
      },
      activeStop: {
        light: 0,
        dark: 0
      },
      draggingStop: {
        active: false,
        mode: null,
        index: null,
        startX: 0,
        containerWidth: 0
      },
      popupStyle: {
        top: '0px',
        left: '0px'
      },
      popupPosition: 'bottom', // 'bottom' or 'top'
      presets: [
        {
          light: 'linear-gradient(90deg, #FFFFFF 0%, #0066FF 100%)',
          dark: 'linear-gradient(90deg, #000000 0%, #3399FF 100%)'
        },
        {
          light: 'linear-gradient(45deg, #FF9A9E 0%, #FAD0C4 100%)',
          dark: 'linear-gradient(45deg, #434343 0%, #000000 100%)'
        },
        {
          light: 'linear-gradient(120deg, #84FAB0 0%, #8FD3F4 100%)',
          dark: 'linear-gradient(120deg, #243949 0%, #517FA4 100%)'
        },
        {
          light: 'linear-gradient(to right, #F2994A 0%, #F2C94C 100%)',
          dark: 'linear-gradient(to right, #0F2027 0%, #203A43 50%, #2C5364 100%)'
        },
        {
          light: 'linear-gradient(to right, #A770EF 0%, #CF8BF3 50%, #FDB99B 100%)',
          dark: 'linear-gradient(to right, #373B44 0%, #4286f4 100%)'
        },
        {
          light: 'radial-gradient(circle at 50% 50%, #FFFFFF 0%, #0066FF 100%)',
          dark: 'radial-gradient(circle at 50% 50%, #000000 0%, #3399FF 100%)'
        },
        {
          light: 'radial-gradient(circle at 20% 80%, #FF9A9E 0%, #FAD0C4 100%)',
          dark: 'radial-gradient(circle at 20% 80%, #434343 0%, #000000 100%)'
        },
        {
          light: 'linear-gradient(180deg, #FFFFFF 0%, #6DD5FA 50%, #2980B9 100%)',
          dark: 'linear-gradient(180deg, #000000 0%, #2C3E50 100%)'
        }
      ]
    };
  },
  computed: {
    // Calculate preview gradients
    previewLightGradient() {
      if (!this.modelValue) return 'linear-gradient(90deg, #FFFFFF 0%, #0066FF 100%)';
      return this.isGradientObject(this.modelValue) 
        ? this.modelValue.light 
        : this.modelValue;
    },
    
    previewDarkGradient() {
      if (!this.modelValue) return 'linear-gradient(90deg, #000000 0%, #3399FF 100%)';
      if (this.isGradientObject(this.modelValue)) return this.modelValue.dark;
      
      // Use stored cached value to avoid recalculation
      return this.getOrCreateInverseLightGradient(this.modelValue);
    }
  },
  watch: {
    modelValue: {
      handler(newValue) {
        // Prevent recursive updates by checking if the value actually changed
        if (JSON.stringify(newValue) !== JSON.stringify(this.lastModelValue)) {
          this.lastModelValue = JSON.parse(JSON.stringify(newValue));
          this.initFromModelValue();
        }
      },
      immediate: true,
      deep: true
    },
    
    // Watch for display mode changes manually
    displayMode(newMode) {
      console.log("Display mode changed in watch:", newMode);
    }
  },
  mounted() {
    // Initialize with default display mode from props
    this.displayMode = this.defaultDisplayMode;
    
    // Add event listeners
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
    // We no longer need resize listener as InputDetailComponent handles this
  },
  beforeUnmount() {
    // Remove event listeners
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  },
  methods: {
    // Check if a value is a gradient object with light/dark properties
    isGradientObject(value) {
      return value && typeof value === 'object' && 'light' in value && 'dark' in value;
    },
    
    // Initialize component data from model value
    initFromModelValue() {
      // Check the update flag to prevent recursive updates
      if (this.isUpdating) return;
      
      // Set the flag to prevent further updates
      this.isUpdating = true;
      
      try {
        if (this.isGradientObject(this.modelValue)) {
          // It's a gradient object with light/dark properties
          this.parseGradientString('light', this.modelValue.light);
          this.parseGradientString('dark', this.modelValue.dark);
        } else if (typeof this.modelValue === 'string') {
          // It's a single gradient value, parse it and generate a dark version
          this.parseGradientString('light', this.modelValue);
          
          // Use the cached inverse calculation to avoid recursive updates
          const darkGradient = this.safeParseLightGradient(this.modelValue);
          this.parseGradientString('dark', darkGradient);
        } else {
          // Use defaults - no need to call updateGradient here
          this.tempGradients = {
            light: {
              type: 'linear',
              angle: 90,
              position: { x: 50, y: 50 },
              stops: [
                { color: '#FFFFFF', position: 0 },
                { color: '#0066FF', position: 100 }
              ],
              cssString: 'linear-gradient(90deg, #FFFFFF 0%, #0066FF 100%)'
            },
            dark: {
              type: 'linear',
              angle: 90,
              position: { x: 50, y: 50 },
              stops: [
                { color: '#000000', position: 0 },
                { color: '#3399FF', position: 100 }
              ],
              cssString: 'linear-gradient(90deg, #000000 0%, #3399FF 100%)'
            }
          };
        }
        
        // Store original values for cancel operation
        this.originalGradients = JSON.parse(JSON.stringify(this.tempGradients));
      } finally {
        // Clear the updating flag after a delay to ensure the current cycle completes
        this.$nextTick(() => {
          this.isUpdating = false;
        });
      }
    },
    
    // No longer needed as InputDetailComponent handles resize and positioning
    // handleResize() { } - Removed to fix duplicate key error
    
    // Safe wrapper that doesn't modify component state
    safeParseLightGradient(lightGradient) {
      try {
        if (!lightGradient) return 'linear-gradient(90deg, #000000 0%, #3399FF 100%)';
        
        // Create a temporary gradient object for parsing without modifying component state
        const tempGradientObj = {
          type: 'linear',
          angle: 90,
          position: { x: 50, y: 50 },
          stops: []
        };
        
        // Simple parsing of linear gradient string (basic support)
        if (lightGradient.includes('linear-gradient')) {
          tempGradientObj.type = 'linear';
          
          // Extract angle
          const angleMatch = lightGradient.match(/linear-gradient\(\s*(\d+)deg/);
          if (angleMatch) {
            tempGradientObj.angle = parseInt(angleMatch[1], 10);
          }
          
          // Extract color stops with a simple regex
          const colorStops = [];
          const stopRegex = /(#[0-9a-f]{3,8}|rgba?\([^)]+\))\s+(\d+)%/gi;
          let match;
          
          while ((match = stopRegex.exec(lightGradient)) !== null) {
            colorStops.push({
              color: match[1],
              position: parseInt(match[2], 10)
            });
          }
          
          if (colorStops.length > 0) {
            tempGradientObj.stops = colorStops;
          } else {
            // Fallback to default stops
            tempGradientObj.stops = [
              { color: '#000000', position: 0 },
              { color: '#3399FF', position: 100 }
            ];
          }
        } else if (lightGradient.includes('radial-gradient')) {
          tempGradientObj.type = 'radial';
          // Similar radial gradient parsing (simplified)
          // ...
        } else {
          // If we can't parse it, return a default dark gradient
          return 'linear-gradient(90deg, #000000 0%, #3399FF 100%)';
        }
        
        // Create the dark version by inverting colors
        const darkStops = tempGradientObj.stops.map(stop => ({
          position: stop.position,
          color: this.invertColor(stop.color)
        }));
        
        // Generate dark CSS without modifying component state
        let cssString = '';
        if (tempGradientObj.type === 'linear') {
          cssString = `linear-gradient(${tempGradientObj.angle}deg, `;
        } else {
          cssString = `radial-gradient(circle at ${tempGradientObj.position.x}% ${tempGradientObj.position.y}%, `;
        }
        
        // Add color stops
        darkStops.forEach((stop, index) => {
          cssString += `${stop.color} ${stop.position}%`;
          if (index < darkStops.length - 1) {
            cssString += ', ';
          }
        });
        
        cssString += ')';
        return cssString;
      } catch (error) {
        console.error('Error inverting gradient:', error);
        return 'linear-gradient(90deg, #000000 0%, #3399FF 100%)';
      }
    },
    
    // Invert a color from light to dark or vice versa
    invertColor(hex) {
      if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
      }
      
      // Convert to RGB
      let r = parseInt(hex.slice(0, 2), 16);
      let g = parseInt(hex.slice(2, 4), 16);
      let b = parseInt(hex.slice(4, 6), 16);
      
      // Invert colors
      r = 255 - r;
      g = 255 - g;
      b = 255 - b;
      
      // Convert back to hex
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    },
    
    // Parse gradient string into component parts
    parseGradientString(mode, gradientString) {
      if (!gradientString) return;
      
      try {
        // Initialize with defaults
        const result = {
          type: 'linear',
          angle: 90,
          position: { x: 50, y: 50 },
          stops: [
            { color: mode === 'light' ? '#FFFFFF' : '#000000', position: 0 },
            { color: mode === 'light' ? '#0066FF' : '#3399FF', position: 100 }
          ]
        };
        
        // Parse linear gradient
        if (gradientString.includes('linear-gradient')) {
          result.type = 'linear';
          
          // Extract angle
          const angleMatch = gradientString.match(/linear-gradient\(\s*(\d+)deg/);
          if (angleMatch) {
            result.angle = parseInt(angleMatch[1], 10);
          } else if (gradientString.includes('to right')) {
            result.angle = 90;
          } else if (gradientString.includes('to left')) {
            result.angle = 270;
          } else if (gradientString.includes('to bottom')) {
            result.angle = 180;
          } else if (gradientString.includes('to top')) {
            result.angle = 0;
          }
          
          // Extract color stops
          const stopsString = gradientString.substring(
            gradientString.indexOf(',') + 1,
            gradientString.lastIndexOf(')')
          );
          
          result.stops = this.parseColorStops(stopsString);
        }
        // Parse radial gradient
        else if (gradientString.includes('radial-gradient')) {
          result.type = 'radial';
          
          // Extract position
          const positionMatch = gradientString.match(/at\s+(\d+)%\s+(\d+)%/);
          if (positionMatch) {
            result.position.x = parseInt(positionMatch[1], 10);
            result.position.y = parseInt(positionMatch[2], 10);
          }
          
          // Extract color stops
          const stopsStart = gradientString.indexOf(',', gradientString.indexOf('at'));
          const stopsString = gradientString.substring(
            stopsStart + 1,
            gradientString.lastIndexOf(')')
          );
          
          result.stops = this.parseColorStops(stopsString);
        }
        
        // Update the temporary gradient
        this.tempGradients[mode] = result;
        this.updateGradient(mode);
        
        // Select the first stop by default
        this.activeStop[mode] = 0;
        
      } catch (error) {
        console.error(`Error parsing gradient string: ${error}`);
      }
    },
    
    // Parse color stop strings like "#FFFFFF 0%, #0066FF 100%"
    parseColorStops(stopsString) {
      const stops = [];
      const stopMatches = stopsString.match(/(#[0-9a-f]{3,8}|rgba?\([^)]+\))\s+(\d+)%/gi);
      
      if (stopMatches) {
        stopMatches.forEach(stopMatch => {
          const parts = stopMatch.trim().split(/\s+/);
          if (parts.length >= 2) {
            const color = parts[0];
            const position = parseInt(parts[1], 10);
            stops.push({ color, position });
          }
        });
      }
      
      // Ensure at least 2 stops
      if (stops.length < 2) {
        stops.push({ color: '#FFFFFF', position: 0 });
        stops.push({ color: '#0066FF', position: 100 });
      }
      
      // Sort by position
      return stops.sort((a, b) => a.position - b.position);
    },
    
    // Generate CSS gradient string from component parts
    generateGradientCSS(mode, gradient = null) {
      const g = gradient || this.tempGradients[mode];
      let cssString = '';
      
      if (g.type === 'linear') {
        cssString = `linear-gradient(${g.angle}deg, `;
      } else {
        cssString = `radial-gradient(circle at ${g.position.x}% ${g.position.y}%, `;
      }
      
      // Add color stops
      g.stops.forEach((stop, index) => {
        cssString += `${stop.color} ${stop.position}%`;
        if (index < g.stops.length - 1) {
          cssString += ', ';
        }
      });
      
      cssString += ')';
      return cssString;
    },
    
    // Update gradient after changes
    updateGradient(mode) {
      // Sort stops by position
      this.tempGradients[mode].stops.sort((a, b) => a.position - b.position);
      
      // Generate CSS string
      this.tempGradients[mode].cssString = this.generateGradientCSS(mode);
      
      // If gradients are linked, update dark mode to match light mode
      if (this.gradientsLinked && mode === 'light') {
        // Create a copy of the stops to avoid reactivity issues
        const invertedStops = this.tempGradients.light.stops.map(stop => ({
          position: stop.position,
          color: this.invertColor(stop.color)
        }));
        
        // Update dark mode properties
        this.$nextTick(() => {
          this.tempGradients.dark.type = this.tempGradients.light.type;
          this.tempGradients.dark.angle = this.tempGradients.light.angle;
          this.tempGradients.dark.position = { ...this.tempGradients.light.position };
          this.tempGradients.dark.stops = invertedStops;
          this.tempGradients.dark.cssString = this.generateGradientCSS('dark');
        });
      }
    },
    
    // Open the gradient selection panel
    openPanel() {
      this.initFromModelValue();
      this.calculatePopupPosition();
      this.panelOpen = true;
      
      // Add a small delay to ensure the panel is rendered before positioning
      this.$nextTick(() => {
        this.calculatePopupPosition();
      });
    },
    
    // Calculate and set the popup position
    calculatePopupPosition() {
      const triggerEl = this.$refs.gradientPreview;
      if (!triggerEl) return;
      
      const triggerRect = triggerEl.getBoundingClientRect();
      const panelWidth = 400; // Fixed panel width
      const panelHeight = 650; // Estimated panel height
      
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
      
      // Check if it goes off-screen horizontally
      this.$nextTick(() => {
        const panel = this.$refs.gradientPanel;
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
      let parent = this.$el?.parentElement;
      while (parent) {
        parent.addEventListener('scroll', this.handleScroll);
        parent = parent.parentElement;
      }
    },
    
    // Remove scroll listeners
    removeScrollListeners() {
      let parent = this.$el?.parentElement;
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
      const gradientPanel = this.$refs.gradientPanel;
      const gradientPreview = this.$refs.gradientPreview;
      
      if (this.panelOpen && gradientPanel && gradientPreview) {
        if (!gradientPanel.contains(event.target) && !gradientPreview.contains(event.target)) {
          this.cancelSelection();
        }
      }
    },
    
    // Select a color stop
    selectStop(mode, index) {
      this.activeStop[mode] = index;
    },
    
    // Add a new color stop
    addStop(mode) {
      const stops = this.tempGradients[mode].stops;
      
      if (stops.length < 10) { // Limit to 10 stops
        // Find midpoint between two existing stops
        const index = Math.max(0, this.activeStop[mode]);
        const nextIndex = Math.min(stops.length - 1, index + 1);
        
        const pos1 = stops[index].position;
        const pos2 = index === nextIndex ? 100 : stops[nextIndex].position;
        const newPosition = Math.round((pos1 + pos2) / 2);
        
        // Get a color that's a blend of neighboring stops
        const color1 = stops[index].color;
        const color2 = index === nextIndex ? '#FFFFFF' : stops[nextIndex].color;
        const newColor = this.blendColors(color1, color2, 0.5);
        
        // Add the new stop
        stops.push({ color: newColor, position: newPosition });
        
        // Sort stops by position and update
        this.updateGradient(mode);
        
        // Find the index of the newly added stop
        const newIndex = stops.findIndex(stop => stop.position === newPosition);
        this.activeStop[mode] = newIndex;
      }
    },
    
    // Blend two colors
    blendColors(color1, color2, ratio) {
      function hex2rgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
      }
      
      function rgb2hex(rgb) {
        return `#${rgb.map(c => Math.round(c).toString(16).padStart(2, '0')).join('')}`;
      }
      
      const rgb1 = hex2rgb(color1);
      const rgb2 = hex2rgb(color2);
      
      const blend = rgb1.map((c, i) => c * (1 - ratio) + rgb2[i] * ratio);
      return rgb2hex(blend);
    },
    
    // Remove a color stop
    removeStop(mode, index) {
      const stops = this.tempGradients[mode].stops;
      
      if (stops.length > 2) { // Always keep at least 2 stops
        stops.splice(index, 1);
        
        // Adjust active stop index
        if (this.activeStop[mode] >= stops.length) {
          this.activeStop[mode] = stops.length - 1;
        }
        
        this.updateGradient(mode);
      }
    },
    
    // Start dragging a color stop
    startDragStop(mode, index, event) {
      // Prevent default selection behavior
      event.preventDefault();
      
      const stopsEl = event.target.parentElement;
      if (!stopsEl) return;
      
      this.draggingStop = {
        active: true,
        mode,
        index,
        startX: event.clientX,
        containerWidth: stopsEl.clientWidth
      };
      
      // Select this stop
      this.activeStop[mode] = index;
    },
    
    // Handle mouse movement while dragging
    handleMouseMove(event) {
      if (!this.draggingStop.active) return;
      
      // If gradients are linked and we're trying to drag a dark mode stop, ignore
      if (this.gradientsLinked && this.draggingStop.mode === 'dark') return;
      
      const { mode, index, startX, containerWidth } = this.draggingStop;
      
      // Calculate new position percentage
      const deltaX = event.clientX - startX;
      const deltaPercent = (deltaX / containerWidth) * 100;
      
      // Adjust the stop position, keeping within 0-100 bounds
      const stops = this.tempGradients[mode].stops;
      let newPosition = Math.max(0, Math.min(100, stops[index].position + deltaPercent));
      
      // Optional: Snap to 5% increments when holding Shift
      if (event.shiftKey) {
        newPosition = Math.round(newPosition / 5) * 5;
      }
      
      // Update stop position
      stops[index].position = newPosition;
      
      // Update the gradient
      this.updateGradient(mode);
      
      // Update drag start position
      this.draggingStop.startX = event.clientX;
    },
    
    // Handle mouse up to end dragging
    handleMouseUp() {
      this.draggingStop.active = false;
    },
    
    // Toggle gradient link
    toggleGradientLink() {
      this.gradientsLinked = !this.gradientsLinked;
      
      if (this.gradientsLinked) {
        // Update dark mode to match light mode when linked
        this.updateGradient('light');
      }
    },
    
    // Apply a preset
    applyPreset(mode, index) {
      const presetGradient = this.presets[index][mode];
      this.parseGradientString(mode, presetGradient);
      
      if (this.gradientsLinked && mode === 'light') {
        // If linked, also apply to dark mode
        this.parseGradientString('dark', this.presets[index].dark);
      }
    },
    
    // Apply the selection
    applySelection() {
      // Set flag to prevent recursive updates
      this.isUpdating = true;
      
      // Create result object with light/dark gradient strings
      const result = {
        light: this.tempGradients.light.cssString,
        dark: this.tempGradients.dark.cssString
      };
      
      // Cache the current value to prevent recursive updates in the watcher
      this.lastModelValue = JSON.parse(JSON.stringify(result));
      
      // Emit the update event
      this.$emit('update:modelValue', result);
      this.panelOpen = false;
      
      // Clear the updating flag after the current update cycle
      this.$nextTick(() => {
        this.isUpdating = false;
      });
    },
    
    // Cancel and close the panel
    cancelSelection() {
      this.tempGradients = JSON.parse(JSON.stringify(this.originalGradients));
      this.panelOpen = false;
    },

    getOrCreateInverseLightGradient(gradient) {
      if (!gradient || !gradient.stops) return gradient;
      // Invert the gradient by reversing its stops
      return {
        ...gradient,
        stops: gradient.stops.slice().reverse()
      };
    }
  }
};
</script>

<style scoped>
.themed-gradient-input {
  position: relative;
  margin-bottom: 10px;
}

/* Gradient Preview Button Styles */
.gradient-preview-container {
  width: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}
.gradient-preview {
  width: 100%;
  height: 100%;
  display: flex;
}
.gradient-preview > div {
  width: 50%;
  height: 100%;
  position: relative;
}

/* Gradient Preview */
.gradient-preview-container {
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

.gradient-preview-container:hover {
  border-color: #aaa;
}

/* Large size variant */
.gradient-preview-container.large {
  padding: 8px;
}

.gradient-preview-container.large .gradient-preview {
  width: 90px;
  height: 45px;
}

.gradient-preview-container.large .gradient-preview-label {
  font-size: 16px;
}

.gradient-preview {
  display: flex;
  width: 250px;
  height:100px;
  border-radius: 3px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.gradient-preview-light, 
.gradient-preview-dark {
  width: 50%;
  height: 100%;
  position: relative;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.mode-indicator {
  position: absolute;
  font-size: 10px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.6;
}

.gradient-preview-label {
  margin-left: 10px;
  font-size: 14px;
  color: #555;
}

/* Gradient Panel Popup */
.gradient-panel-popup {
  position: fixed;
  width: 400px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  max-height: 90vh;
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
  padding: 12px 15px;
  overflow-y: auto;
  max-height: 70vh;
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
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.mode-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.mode-section h4 {
  margin: 0 0 12px 0;
  font-size: 15px;
  color: #444;
  display: flex;
  align-items: center;
}

.mode-icon {
  margin-right: 5px;
  font-size: 14px;
}

.mode-section h5 {
  margin: 15px 0 8px 0;
  font-size: 13px;
  color: #666;
}

/* Gradient Large Preview */
.gradient-large-preview {
  height: 60px;
  border-radius: 6px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Gradient Type Controls */
.gradient-type-controls {
  margin-bottom: 15px;
}

.gradient-type-controls.disabled {
  opacity: 0.7;
  pointer-events: none;
}

.radio-group {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 13px;
  color: #555;
}

.radio-label input {
  margin-right: 5px;
}

/* Angle Control */
.angle-control {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
}

.angle-control label,
.position-control label {
  font-size: 12px;
  color: #666;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.slider-container input[type="range"] {
  flex: 1;
}

.angle-input {
  width: 50px;
  padding: 3px 5px;
  font-size: 12px;
  border: 1px solid #ddd;
  border-radius: 3px;
}

/* Position Controls */
.position-control {
  margin-bottom: 10px;
}

.position-inputs {
  display: flex;
  gap: 15px;
}

.position-input-group {
  display: flex;
  align-items: center;
  gap: 5px;
}

.position-input-group label {
  width: 15px;
}

.position-input-group input {
  width: 50px;
  padding: 3px 5px;
  font-size: 12px;
  border: 1px solid #ddd;
  border-radius: 3px;
}

/* Color Stops Section */
.color-stops-section {
  margin-bottom: 15px;
}

.color-stops-section.disabled {
  opacity: 0.7;
  pointer-events: none;
}

.color-stops-preview {
  position: relative;
  height: 40px;
  margin-bottom: 15px;
}

.color-stops-bar {
  width: 100%;
  height: 20px;
  border-radius: 4px;
  margin-bottom: 5px;
}

.color-stops-markers {
  position: relative;
  width: 100%;
  height: 15px;
}

.color-stop-marker {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  transform: translate(-50%, 0);
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.2s;
}

.color-stop-marker:hover,
.color-stop-marker.active {
  transform: translate(-50%, 0) scale(1.2);
  z-index: 10;
}

/* Stop Controls */
.stop-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #eee;
}

.stop-color-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-input-container {
  position: relative;
  width: 30px;
  height: 30px;
}

.color-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 30px;
  height: 30px;
  opacity: 0;
  cursor: pointer;
}

.color-preview {
  width: 100%;
  height: 100%;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.hex-input {
  width: 80px;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
}

.stop-position-control {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-left: auto;
}

.stop-position-control label {
  font-size: 12px;
  color: #666;
}

.position-input {
  width: 50px;
  padding: 3px 5px;
  font-size: 12px;
  border: 1px solid #ddd;
  border-radius: 3px;
}

.stop-actions {
  display: flex;
  justify-content: flex-end;
}

.stop-buttons {
  display: flex;
  justify-content: center;
  margin-top: 5px;
}

/* Gradient Presets */
.gradient-presets {
  margin-bottom: 15px;
}

.gradient-presets.disabled {
  opacity: 0.7;
  pointer-events: none;
}

.presets-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.preset-btn {
  height: 30px;
  border-radius: 4px;
  border: 1px solid #ddd;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.preset-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* Link Gradients Button */
.link-gradients-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: #f5f5f5;
  margin-top: 15px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 13px;
  color: #555;
}

.link-gradients-btn:hover {
  background-color: #e8e8e8;
}

.link-gradients-btn.linked {
  background-color: #e0f0ff;
  border-color: #a0d0ff;
  color: #0066cc;
}

.link-icon {
  margin-right: 5px;
  font-size: 12px;
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

.btn.btn-small {
  padding: 3px 8px;
  font-size: 12px;
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

.btn.add-stop {
  background-color: #f0f0f0;
  color: #333;
}

.btn.add-stop:hover {
  background-color: #e0e0e0;
}

.btn.remove-stop {
  background-color: #fff0f0;
  color: #cc3333;
  border: 1px solid #ffcccc;
}

.btn.remove-stop:hover {
  background-color: #ffe0e0;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>