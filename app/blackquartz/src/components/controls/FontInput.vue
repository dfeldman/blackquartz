<template>
  <div class="font-input" ref="fontInputContainer">
    <!-- Font Preview Button -->
    <div 
      class="font-preview-container" 
      :class="{ 'large': size === 'large' }"
      @click="openPanel"
      ref="fontPreview"
    >
      <div class="font-preview" :style="previewStyle">
        {{ label || 'Aa' }}
      </div>
      <div class="font-details">
        <div class="font-name">{{ displayFontName }}</div>
        <div class="font-size">{{ fontConfig.size }}pt • {{ safeWeightLabel }}</div>
      </div>
    </div>
    
    <!-- Font Panel using InputDetailComponent -->
    <InputDetailComponent
      v-if="tempConfig"
      :visible="panelOpen"
      :title="label || 'Select Font'"
      :display-mode="displayMode"
      :target-element="$refs.fontPreview"
      :position="panelPosition"
      @close="cancelSelection"
      @apply="applySelection"
      @cancel="cancelSelection"
      @update:display-mode="updateDisplayMode"
      @update:position="updatePanelPosition"
    >
      <!-- Font Configuration Panel Content -->
      <div class="font-panel-content">
        <!-- Search Box -->
        <div class="search-container">
          <input 
            type="text" 
            v-model="searchTerm" 
            @input="searchFonts" 
            placeholder="Search fonts..."
            class="search-input"
          >
        </div>
        
        <!-- Font Preview -->
        <div class="font-preview-area">
          <div 
            class="preview-text" 
            :style="getPreviewStyle()"
            ref="previewText"
          >
            Sphinx of black quartz, judge my vow
          
            Sphinx of black quartz, judge my vow
          </div>
        </div>
        
        <!-- Size and Weight Controls -->
        <div class="font-controls">
          <div class="control-group">
            <label>Size</label>
            <div class="slider-container">
              <input 
                type="range" 
                v-model.number="tempConfig.size" 
                min="6" 
                max="72" 
                step="1"
                class="slider"
              >
              <div class="slider-value">{{ tempConfig.size }}pt</div>
            </div>
          </div>
          
          <!-- Weight Control (always slider) -->
          <div class="control-group">
            <label>Weight</label>
            <div class="slider-container">
              <input 
                type="range" 
                v-model.number="tempConfig.weight" 
                :min="getAxisMin('wght')" 
                :max="getAxisMax('wght')" 
                :step="selectedFontInfo && selectedFontInfo.isVariable ? 1 : getWeightStep()"
                class="slider"
                :list="selectedFontInfo && !selectedFontInfo.isVariable ? 'weight-datalist' : null"
              >
              <datalist v-if="selectedFontInfo && !selectedFontInfo.isVariable" id="weight-datalist">
                <option 
                  v-for="weight in availableWeights" 
                  :key="weight" 
                  :value="parseInt(weight)"
                ></option>
              </datalist>
              <div class="slider-value">{{ safeWeightLabel }}</div>
            </div>
          </div>
          
          <!-- Additional Axes Controls (if available) -->
          <template v-for="axis in additionalAxes" :key="axis.tag">
            <div class="control-group">
              <label>{{ axis.tag === 'wdth' ? 'Width' : 
                        axis.tag === 'slnt' ? 'Slant' : 
                        axis.tag === 'ital' ? 'Italic' : 
                        axis.tag === 'opsz' ? 'Optical Size' : 
                        axis.tag.toUpperCase() }}</label>
              <div class="slider-container">
                <input 
                  type="range" 
                  :min="axis.start" 
                  :max="axis.end" 
                  step="1"
                  class="slider"
                  :value="tempConfig.axes[axis.tag]"
                  @input="updateAxisValue(axis.tag, $event.target.value)"
                >
                <div class="slider-value">{{ tempConfig.axes[axis.tag] }}</div>
              </div>
            </div>
          </template>
        </div>
        
        <!-- Font Effects -->
        <div class="font-effects">
          <label>Effects</label>
          <select v-model="tempConfig.effect" class="effect-select">
            <option value="none">None</option>
            <option value="uppercase">ALL CAPS</option>
            <option value="small-caps">Small Caps</option>
            <option value="highlight">Highlight</option>
            <option value="shadow">Shadow</option>
            <option value="drop-shadow">Drop Shadow</option>
            <option value="underline">Underline</option>
            <option value="strikethrough">Strikethrough</option>
            <option value="drop-cap">Drop Cap</option>
          </select>
        </div>
        
        <!-- Font List -->
        <div class="font-list-container">
          <div v-if="fonts.length === 0 && searchTerm.length > 0" class="no-results">
            No fonts found matching "{{ searchTerm }}".
          </div>
          
          <div v-else class="font-list">
            <div 
              v-for="font in fonts" 
              :key="font.family"
              class="font-item" 
              :class="{ 'selected': tempConfig.family === font.family }"
              @click="selectFont(font)"
            >
              <div 
                class="font-item-name" 
                :style="{ 
                  fontFamily: `'${font.family}', ${font.category}`,
                  fontWeight: getFontPreviewWeight(font)
                }"
              >
                {{ font.family }}
              </div>
              <div class="font-item-category">{{ font.category }}</div>
            </div>
          </div>
        </div>
      </div>
    </InputDetailComponent>
  </div>
</template>

<script>
import { reactive } from 'vue';
import { FONTS } from '../../constants/fonts.js';
import InputDetailComponent from './InputDetailComponent.vue';

// Font loader helper (unchanged)
const fontLoader = {
  loadedFonts: new Set(),
  
  // Load a specific font
  load(fontFamily, weights = ["400"]) {
    if (!fontFamily) return Promise.resolve();
    
    const key = `${fontFamily}:${weights.join(',')}`;
    if (this.loadedFonts.has(key)) return Promise.resolve();
    
    return new Promise((resolve, reject) => {
      // Check if WebFont is available
      if (!window.WebFont) {
        // Load the WebFont library if not available
        const wf = document.createElement('script');
        wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
        wf.async = true;
        
        wf.onload = () => {
          this._loadWithWebFont(fontFamily, weights, resolve, reject);
        };
        
        wf.onerror = () => {
          reject(new Error('Failed to load WebFont loader'));
        };
        
        document.head.appendChild(wf);
      } else {
        this._loadWithWebFont(fontFamily, weights, resolve, reject);
      }
    });
  },
  
  // Internal method to load with WebFont
  _loadWithWebFont(fontFamily, weights, resolve, reject) {
    const weightsStr = weights.join(',');
    const key = `${fontFamily}:${weightsStr}`;
    
    window.WebFont.load({
      google: {
        families: [`${fontFamily}:${weightsStr}`]
      },
      active: () => {
        this.loadedFonts.add(key);
        resolve();
      },
      inactive: () => {
        reject(new Error(`Failed to load font: ${fontFamily}`));
      },
      timeout: 3000 // 3 seconds timeout
    });
  }
};

export default {
  name: 'FontInput',
  components: {
    InputDetailComponent
  },
  props: {
    modelValue: { required: true },
    label: String,
    size: { type: String, default: 'regular' }, // 'regular' or 'large'
    defaultDisplayMode: { type: String, default: 'popup' } // 'popup', 'modal', 'tearoff', 'panel'
  },
  emits: ['update:modelValue'],
  data() {
    return {
      panelOpen: false,
      searchTerm: '',
      fonts: [],
      allFonts: [],
      
      // Display mode and position
      displayMode: this.defaultDisplayMode,
      panelPosition: { top: '0px', left: '0px' },
      
      // Temporary configuration during editing
      tempConfig: null, // Will be initialized in mounted
      
      // Original configuration before editing
      originalConfig: {
        family: 'Roboto',
        category: 'sans-serif',
        size: 16,
        weight: 400,
        effect: 'none',
        axes: {}
      },
      
      // Weight labels
      weightLabels: {
        100: 'Thin',
        200: 'Extra Light',
        300: 'Light',
        400: 'Regular',
        500: 'Medium',
        600: 'Semi Bold',
        700: 'Bold',
        800: 'Extra Bold',
        900: 'Black'
      }
    };
  },
  computed: {
    // Parse the font configuration from the model value
    fontConfig() {
      if (typeof this.modelValue === 'object') {
        return {
          family: this.modelValue.family || 'Roboto',
          category: this.modelValue.category || 'sans-serif',
          size: this.modelValue.size || 16,
          weight: this.modelValue.weight || 400,
          effect: this.modelValue.effect || 'none',
          axes: this.modelValue.axes || {}
        };
      } else if (typeof this.modelValue === 'string') {
        // Parse font string like "'Roboto', sans-serif"
        const fontString = this.modelValue;
        const familyMatch = fontString.match(/'([^']+)'/);
        const categoryMatch = fontString.match(/, ([a-z-]+)$/);
        
        return {
          family: familyMatch ? familyMatch[1] : 'Roboto',
          category: categoryMatch ? categoryMatch[1] : 'sans-serif',
          size: 16,
          weight: 400,
          effect: 'none',
          axes: {}
        };
      }
      
      return {
        family: 'Roboto',
        category: 'sans-serif',
        size: 16,
        weight: 400,
        effect: 'none',
        axes: {}
      };
    },
    
    // Display name for the font
    displayFontName() {
      return this.fontConfig.family;
    },
    
    // Style for the preview button
    previewStyle() {
      return {
        fontFamily: `'${this.fontConfig.family}', ${this.fontConfig.category}`,
        fontWeight: this.fontConfig.weight,
        fontVariationSettings: this.getVariationSettingsFromConfig(this.fontConfig)
      };
    },
    
    // Safe weight label that handles null tempConfig
    safeWeightLabel() {
      if (!this.tempConfig) {
        return this.weightLabels[400] || 'Regular'; // Default when tempConfig is null
      }
      
      const weight = this.tempConfig.weight;
      return this.weightLabels[weight] || this.approximateWeightLabel(weight);
    },
    
    // Get the currently selected font info
    selectedFontInfo() {
      if (!this.tempConfig) return null;
      return FONTS[this.tempConfig.family] || null;
    },
    
    // Available weights for the selected font (for non-variable fonts)
    availableWeights() {
      if (!this.selectedFontInfo) return ["400"];
      return this.selectedFontInfo.weights || ["400"];
    },
    
    // Additional axes for variable fonts (excluding weight)
    additionalAxes() {
      if (!this.selectedFontInfo || !this.selectedFontInfo.isVariable || !this.selectedFontInfo.axes) {
        return [];
      }
      
      return this.selectedFontInfo.axes.filter(axis => axis.tag !== 'wght');
    }
  },
  watch: {
    modelValue: {
      handler() {
        if (this.tempConfig) {
          this.initFromModelValue();
        }
      },
      immediate: true
    }
  },
  mounted() {
    console.log('FontInput component mounted');
    
    // Initialize tempConfig immediately with proper reactivity
    this.tempConfig = reactive({
      family: this.fontConfig.family || 'Roboto',
      category: this.fontConfig.category || 'sans-serif',
      size: this.fontConfig.size || 16,
      weight: this.fontConfig.weight || 400,
      effect: this.fontConfig.effect || 'none',
      axes: {}
    });
    
    // Initialize all fonts from the FONTS object
    this.initializeFonts();
    
    // Initialize WebFont loader
    this.initWebFontLoader();
    
    // Initialize from model value
    this.initFromModelValue();
    
    // Set up watcher for axes changes
    this.$watch(
      () => this.tempConfig.axes,
      () => {
        console.log('Axes changed:', this.tempConfig.axes);
        
        // Update the preview text element directly
        this.$nextTick(() => {
          if (this.$refs.previewText) {
            const style = this.getPreviewStyle();
            
            // Apply direct CSS properties first
            Object.entries(style).forEach(([prop, value]) => {
              this.$refs.previewText.style[prop] = value;
            });
            
            // As a fallback, also apply font-variation-settings for better browser compatibility
            if (this.selectedFontInfo && this.selectedFontInfo.isVariable) {
              const variationSettings = this.getVariationSettings();
              if (variationSettings) {
                this.$refs.previewText.style.fontVariationSettings = variationSettings;
              }
            }
          }
          
          this.$forceUpdate();
        });
      },
      { deep: true }
    );
  },
  
  methods: {
    // Display mode management
    updateDisplayMode(newMode) {
      this.displayMode = newMode;
    },
    
    updatePanelPosition(newPosition) {
      this.panelPosition = newPosition;
    },
    
    // Initialize WebFont loader
    initWebFontLoader() {
      if (window.WebFont) return;
      
      // Load the WebFont library if not available
      const wf = document.createElement('script');
      wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
      wf.async = true;
      document.head.appendChild(wf);
    },
    
    // Initialize fonts from the FONTS object
    initializeFonts() {
      this.allFonts = Object.values(FONTS).map(font => ({
        family: font.family,
        category: font.category,
        weights: font.weights || ["400"],
        isVariable: font.isVariable || false,
        axes: font.axes || []
      }));
      
      // Set initial fonts list
      this.fonts = [...this.allFonts];
      
      // Load current font
      this.loadFont(this.fontConfig.family);
    },
    
    // Initialize component data from model value
    initFromModelValue() {
      try {
        if (!this.tempConfig) {
          console.warn('tempConfig is null in initFromModelValue');
          return;
        }
        
        // Update individual properties instead of replacing the entire object
        this.tempConfig.family = this.fontConfig.family || 'Roboto';
        this.tempConfig.category = this.fontConfig.category || 'sans-serif';
        this.tempConfig.size = this.fontConfig.size || 16;
        this.tempConfig.weight = this.fontConfig.weight || 400;
        this.tempConfig.effect = this.fontConfig.effect || 'none';
        
        // Important: create a new empty object for axes to avoid reactivity issues
        this.tempConfig.axes = {};
        
        // Copy axes safely from fontConfig
        if (this.fontConfig.axes) {
          Object.entries(this.fontConfig.axes).forEach(([key, value]) => {
            this.tempConfig.axes[key] = value;
          });
        }
        
        // Store original config (deep copy)
        this.originalConfig = {
          family: this.fontConfig.family || 'Roboto',
          category: this.fontConfig.category || 'sans-serif',
          size: this.fontConfig.size || 16,
          weight: this.fontConfig.weight || 400,
          effect: this.fontConfig.effect || 'none',
          axes: {}
        };
        
        // Copy axes to originalConfig
        if (this.fontConfig.axes) {
          Object.entries(this.fontConfig.axes).forEach(([key, value]) => {
            this.originalConfig.axes[key] = value;
          });
        }
        
        // Ensure the font is loaded for preview
        this.loadFont(this.tempConfig.family);
      } catch (error) {
        console.error('Error in initFromModelValue:', error);
      }
    },
    
    // Open the font selection panel
    openPanel() {
      if (!this.tempConfig) {
        console.error('tempConfig is null in openPanel');
        return;
      }
      
      this.initFromModelValue();
      this.searchTerm = '';
      
      // Show only top fonts initially instead of all fonts
      this.fonts = this.getTopFonts();
      
      // Load fonts for the list
      this.preloadListFonts();
      
      this.panelOpen = true;
    },
    
    // Get a curated list of top fonts (mix of sans-serif and serif)
    getTopFonts() {
      // Define a list of popular font families
      const popularFamilies = [
        'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro',
        'Merriweather', 'Playfair Display', 'Raleway', 'Poppins', 'Nunito',
        'Roboto Condensed', 'Oswald', 'Inter', 'Noto Sans', 'Lora',
        'PT Sans', 'Roboto Mono', 'Ubuntu', 'Fira Sans', 'Mukta'
      ];
      
      // Filter the allFonts array to include only fonts from the popularFamilies list
      // If a font in popularFamilies doesn't exist in allFonts, it will be skipped
      const topFonts = this.allFonts.filter(font => 
        popularFamilies.includes(font.family)
      );
      
      // Sort the top fonts according to the order in popularFamilies
      topFonts.sort((a, b) => {
        const indexA = popularFamilies.indexOf(a.family);
        const indexB = popularFamilies.indexOf(b.family);
        return indexA - indexB;
      });
      
      // Limit to 20 fonts (though the list should already be curated)
      return topFonts.slice(0, 20);
    },
    
    // Preload fonts for the visible list items
    preloadListFonts() {
      // Preload first 20 fonts for better user experience
      const fontsToPreload = this.fonts.slice(0, 20);
      
      for (const font of fontsToPreload) {
        this.loadFont(font.family);
      }
    },
    
    // Load a specific font with appropriate weights and variations
    loadFont(fontFamily) {
      if (!fontFamily) return;
      
      const fontInfo = FONTS[fontFamily];
      if (!fontInfo) return;
      
      try {
        // For variable fonts, we need to include the axis ranges in the URL
        let fontURL = fontFamily.replace(/ /g, '+');
        
        if (fontInfo.isVariable && fontInfo.axes) {
          // Add axis ranges to the URL
          const axisParams = fontInfo.axes.map(axis => {
            return `${axis.tag},${axis.start}..${axis.end}`;
          }).join(';');
          
          if (axisParams) {
            fontURL += `:${axisParams}`;
          }
        } else if (fontInfo.weights && fontInfo.weights.length) {
          // For non-variable fonts, include all available weights
          fontURL += `:${fontInfo.weights.join(',')}`;
        }
        
        console.log('Loading font:', fontURL);
        
        // Use WebFont to load the font if available
        if (window.WebFont) {
          window.WebFont.load({
            google: {
              families: [fontURL]
            },
            active: () => {
              console.log('Font loaded successfully:', fontFamily);
              this.$forceUpdate();
            },
            inactive: () => {
              console.warn('Failed to load font:', fontFamily);
            }
          });
        } else {
          // Fallback: add a link element to load the font
          const linkId = `font-link-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`;
          let link = document.getElementById(linkId);
          
          if (!link) {
            link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
          }
          
          link.href = `https://fonts.googleapis.com/css2?family=${fontURL}&display=swap`;
        }
      } catch (error) {
        console.error('Error loading font:', error);
      }
    },
    
    // Search fonts based on input
    searchFonts() {
      if (this.searchTerm.length === 0) {
        // Show all fonts if search is empty
        this.fonts = [...this.allFonts];
        return;
      }
      
      // Filter fonts based on search term
      const searchLower = this.searchTerm.toLowerCase();
      this.fonts = this.allFonts.filter(font =>
        font.family.toLowerCase().includes(searchLower)
      );
      
      // Preload search results
      this.$nextTick(() => {
        this.preloadListFonts();
      });
    },
    
    // Select a font from the list
    selectFont(font) {
      if (!font || !this.tempConfig) return;
      
      try {
        console.log(`Selecting font: ${font.family}`);
        
        // Update basic properties
        this.tempConfig.family = font.family;
        this.tempConfig.category = font.category;
        
        const fontInfo = FONTS[font.family];
        if (!fontInfo) {
          console.warn(`No font info found for ${font.family}`);
          return;
        }
        
        console.log(`Font info for ${font.family}:`, 
                   `variable: ${!!fontInfo.isVariable}`, 
                   `axes: ${fontInfo.axes ? fontInfo.axes.length : 'none'}`,
                   `weights: ${fontInfo.weights ? fontInfo.weights.join(',') : 'none'}`);
        
        // IMPORTANT: Use a completely different approach to clear axes
        this.tempConfig.axes = {};  // This works because tempConfig itself is reactive
        
        // Handle variable font axes
        if (fontInfo.isVariable && Array.isArray(fontInfo.axes) && fontInfo.axes.length > 0) {
          console.log(`Processing variable font axes for ${font.family}`);
          
          // Log all available axes for debugging
          fontInfo.axes.forEach(axis => {
            if (axis && axis.tag) {
              console.log(`Available axis: ${axis.tag}, range: ${axis.start}-${axis.end}`);
            }
          });
          
          for (let i = 0; i < fontInfo.axes.length; i++) {
            const axis = fontInfo.axes[i];
            if (!axis || !axis.tag) continue;
            
            const defaultValue = Math.round((axis.start + axis.end) / 2);
            
            if (axis.tag === 'wght') {
              // Special case for weight
              const weight = Math.min(Math.max(this.tempConfig.weight, axis.start), axis.end);
              this.tempConfig.weight = weight;
            } else {
              // Set other axes (works in Vue 3)
              console.log(`Setting axis ${axis.tag} to ${defaultValue}`);
              this.tempConfig.axes[axis.tag] = defaultValue;
              
              // Force Vue to recognize the change by making a computed property access
              this.$nextTick(() => {
                console.log(`Axis ${axis.tag} set to:`, this.tempConfig.axes[axis.tag]);
              });
            }
          }
        } else if (Array.isArray(fontInfo.weights) && fontInfo.weights.length > 0) {
          console.log(`Processing standard font weights for ${font.family}`);
          // For non-variable fonts, adjust to nearest available weight
          const weights = fontInfo.weights.map(w => parseInt(w));
          this.tempConfig.weight = this.findClosestWeight(weights, this.tempConfig.weight);
        }
        
        // Load the font for preview
        this.loadFont(font.family);
        
        // Force refresh of computed properties
        this.$forceUpdate();
      } catch (error) {
        console.error('Error in selectFont:', error);
      }
    },
    
    // Find closest available weight
    findClosestWeight(weights, targetWeight) {
      return weights.reduce((prev, curr) => 
        Math.abs(curr - targetWeight) < Math.abs(prev - targetWeight) ? curr : prev
      );
    },
    
    // Get weight step for non-variable fonts
    getWeightStep() {
      // If there are very few weights, use a larger step to snap to available weights
      const weights = this.availableWeights.map(w => parseInt(w));
      if (weights.length <= 1) return 100;
      
      // Sort weights in ascending order
      weights.sort((a, b) => a - b);
      
      // Calculate minimum difference between consecutive weights
      let minDiff = 100;
      for (let i = 1; i < weights.length; i++) {
        const diff = weights[i] - weights[i-1];
        if (diff < minDiff) minDiff = diff;
      }
      
      return minDiff;
    },
    
    // Apply the selection
    applySelection() {
      if (!this.tempConfig) return;
      
      // Create the result object
      const result = {
        family: this.tempConfig.family,
        category: this.tempConfig.category,
        size: this.tempConfig.size,
        weight: this.tempConfig.weight,
        effect: this.tempConfig.effect
      };
      
      // Add axes if there are any
      if (this.tempConfig.axes && Object.keys(this.tempConfig.axes).length > 0) {
        result.axes = { ...this.tempConfig.axes };
      }
      
      // Emit the updated model value
      this.$emit('update:modelValue', result);
      this.panelOpen = false;
    },
    
    // Cancel and close the panel
    cancelSelection() {
      if (!this.tempConfig) {
        this.panelOpen = false;
        return;
      }
      
      try {
        // Update from originalConfig, property by property
        this.tempConfig.family = this.originalConfig.family;
        this.tempConfig.category = this.originalConfig.category;
        this.tempConfig.size = this.originalConfig.size;
        this.tempConfig.weight = this.originalConfig.weight;
        this.tempConfig.effect = this.originalConfig.effect;
        
        // Reset axes by creating a new empty object
        this.tempConfig.axes = {};
        
        // Copy axes from originalConfig
        if (this.originalConfig.axes) {
          Object.entries(this.originalConfig.axes).forEach(([key, value]) => {
            this.tempConfig.axes[key] = value;
          });
        }
        
        this.panelOpen = false;
      } catch (error) {
        console.error('Error in cancelSelection:', error);
        this.panelOpen = false;
      }
    },
    
    // Helper methods for style computation
    getTextDecoration() {
      if (!this.tempConfig) return 'none';
      if (this.tempConfig.effect === 'underline') return 'underline';
      if (this.tempConfig.effect === 'strikethrough') return 'line-through';
      return 'none';
    },
    
    getTextShadow() {
      if (!this.tempConfig) return 'none';
      if (this.tempConfig.effect === 'shadow') return '1px 1px 2px rgba(0,0,0,0.3)';
      if (this.tempConfig.effect === 'drop-shadow') return '2px 2px 4px rgba(0,0,0,0.5)';
      return 'none';
    },
    
    // Get the computed style for the preview text
    getPreviewStyle() {
      if (!this.tempConfig) return {};
      
      // Start with basic style properties
      const style = {
        fontFamily: `'${this.tempConfig.family}', ${this.tempConfig.category}`,
        fontSize: `${this.tempConfig.size}pt`,
        textTransform: this.tempConfig.effect === 'uppercase' ? 'uppercase' : 'none',
        fontVariantCaps: this.tempConfig.effect === 'small-caps' ? 'small-caps' : 'normal',
        textDecoration: this.getTextDecoration(),
        textShadow: this.getTextShadow(),
        backgroundColor: this.tempConfig.effect === 'highlight' ? 'rgba(255, 255, 0, 0.3)' : 'transparent'
      };
      
      // Apply font-weight from the tempConfig
      style.fontWeight = this.tempConfig.weight;
      
      // Apply specific CSS properties for each axis if they exist in tempConfig.axes
      if (this.tempConfig.axes) {
        // Width (wdth) → font-stretch
        if (this.tempConfig.axes.wdth !== undefined) {
          // font-stretch accepts percentage values
          style.fontStretch = `${this.tempConfig.axes.wdth}%`;
        }
        
        // Italic (ital) → font-style
        if (this.tempConfig.axes.ital !== undefined) {
          // ital is typically 0 to 1, where 1 is italic
          style.fontStyle = this.tempConfig.axes.ital > 0.5 ? 'italic' : 'normal';
        }
        
        // Slant (slnt) → font-style with oblique
        if (this.tempConfig.axes.slnt !== undefined) {
          // slnt is typically negative for backwards slant
          style.fontStyle = `oblique ${this.tempConfig.axes.slnt}deg`;
        }
        
        // Optical size (opsz) → font-optical-sizing
        if (this.tempConfig.axes.opsz !== undefined) {
          style.fontOpticalSizing = 'auto'; // Enable optical sizing
          // Some fonts might need a specific size set
          style.fontSize = `${this.tempConfig.axes.opsz}pt`;
        }
      }
      
      console.log('Applied style:', style);
      return style;
    },
    
    // Get CSS font-variation-settings string for variable fonts
    getVariationSettings() {
      try {
        if (!this.tempConfig || !this.selectedFontInfo || !this.selectedFontInfo.isVariable) {
          return '';
        }
        
        let settings = `"wght" ${this.tempConfig.weight}`;
        
        // Safely access axes properties
        if (this.tempConfig.axes) {
          const axisEntries = Object.entries(this.tempConfig.axes);
          console.log('Current axes values:', this.tempConfig.axes);
          
          for (let i = 0; i < axisEntries.length; i++) {
            const [tag, value] = axisEntries[i];
            if (tag !== 'wght') { // Skip wght as it's already included
              settings += `, "${tag}" ${value}`;
            }
          }
        }
        
        // Make sure we also add axes from the font definition if they're not in tempConfig
        if (this.selectedFontInfo.axes) {
          for (const axis of this.selectedFontInfo.axes) {
            if (axis.tag !== 'wght' && (!this.tempConfig.axes[axis.tag])) {
              const defaultValue = Math.round((axis.start + axis.end) / 2);
              settings += `, "${axis.tag}" ${defaultValue}`;
              
              // Add it to tempConfig.axes for future use
              this.tempConfig.axes[axis.tag] = defaultValue;
            }
          }
        }
        
        console.log('Font variation settings:', settings);
        return settings;
      } catch (error) {
        console.error('Error in getVariationSettings:', error);
        return '';
      }
    },
    
    // Get variation settings from a config object
    getVariationSettingsFromConfig(config) {
      if (!config || !config.family) return '';
      
      const fontInfo = FONTS[config.family];
      if (!fontInfo || !fontInfo.isVariable) return '';
      
      let settings = `"wght" ${config.weight}`;
      
      // Add other axes
      if (config.axes) {
        for (const [tag, value] of Object.entries(config.axes)) {
          settings += `, "${tag}" ${value}`;
        }
      }
      
      return settings;
    },
    
    // Get the minimum value for an axis
    getAxisMin(tag) {
      if (!this.selectedFontInfo || !this.selectedFontInfo.isVariable || !this.selectedFontInfo.axes) {
        return tag === 'wght' ? 400 : 0;
      }
      
      const axis = this.selectedFontInfo.axes.find(a => a.tag === tag);
      return axis ? axis.start : (tag === 'wght' ? 400 : 0);
    },
    
    // Get the maximum value for an axis
    getAxisMax(tag) {
      if (!this.selectedFontInfo || !this.selectedFontInfo.isVariable || !this.selectedFontInfo.axes) {
        return tag === 'wght' ? 700 : 100;
      }
      
      const axis = this.selectedFontInfo.axes.find(a => a.tag === tag);
      return axis ? axis.end : (tag === 'wght' ? 700 : 100);
    },
    
    // Update axis value with manual event handling
    updateAxisValue(tag, value) {
      if (!this.tempConfig || !this.tempConfig.axes) return;
      
      // Convert to number
      const numValue = parseFloat(value);
      
      console.log(`Updating axis ${tag} to ${numValue}`);
      
      // Set the value
      this.tempConfig.axes[tag] = numValue;
      
      // Update the preview style immediately
      this.$nextTick(() => {
        if (this.$refs.previewText) {
          const style = this.getPreviewStyle();
          Object.entries(style).forEach(([prop, value]) => {
            this.$refs.previewText.style[prop] = value;
          });
          
          // Also update font-variation-settings if applicable
          if (this.selectedFontInfo && this.selectedFontInfo.isVariable) {
            const variationSettings = this.getVariationSettings();
            if (variationSettings) {
              this.$refs.previewText.style.fontVariationSettings = variationSettings;
            }
          }
        }
        
        this.$forceUpdate();
      });
    },
    
    // Get a human-readable label for an axis
    getAxisLabel(tag) {
      const axisLabels = {
        'wght': 'Weight',
        'wdth': 'Width',
        'slnt': 'Slant',
        'ital': 'Italic',
        'opsz': 'Optical Size'
      };
      
      return axisLabels[tag] || tag.toUpperCase();
    },
    
    // Get a weight label for any weight value (including non-standard weights)
    approximateWeightLabel(weight) {
      if (typeof weight !== 'number') return 'Regular';
      
      // Find the closest standard weight
      const standardWeights = [100, 200, 300, 400, 500, 600, 700, 800, 900];
      let closestWeight = standardWeights.reduce((prev, curr) => 
        Math.abs(curr - weight) < Math.abs(prev - weight) ? curr : prev
      );
      
      return this.weightLabels[closestWeight] || `Weight ${weight}`;
    },
    
    // Get a good preview weight for a font in the list
    getFontPreviewWeight(font) {
      const fontInfo = FONTS[font.family];
      if (!fontInfo) return 400;
      
      // For variable fonts, use a weight in the middle of the range
      if (fontInfo.isVariable && fontInfo.axes) {
        const weightAxis = fontInfo.axes.find(a => a.tag === 'wght');
        if (weightAxis) {
          return Math.round((weightAxis.start + weightAxis.end) / 2);
        }
      }
      
      // For non-variable fonts, use the available weights
      const weights = fontInfo.weights;
      if (weights && weights.length) {
        // Prefer regular (400) if available, otherwise medium (500) or bold (700)
        if (weights.includes('400')) return 400;
        if (weights.includes('500')) return 500;
        if (weights.includes('700')) return 700;
        
        // Otherwise use the middle weight
        return parseInt(weights[Math.floor(weights.length / 2)]);
      }
      
      return 400; // Default
    }
  }
};
</script>

<style scoped>
.font-input {
  position: relative;
  margin-bottom: 10px;
}

/* Font Preview Button */
.font-preview-container {
  display: flex;
  align-items: center;
  padding: 8px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  background-color: #f5f5f5;
  transition: border-color 0.2s;
  max-width: fit-content;
}

.font-preview-container:hover {
  border-color: #aaa;
}

/* Large size variant */
.font-preview-container.large {
  padding: 12px 8px;
}

.font-preview-container.large .font-preview {
  font-size: 24px;
}

.font-preview-container.large .font-details {
  font-size: 14px;
}

.font-preview {
  font-size: 18px;
  margin-right: 12px;
}

.font-details {
  display: flex;
  flex-direction: column;
}

.font-name {
  font-weight: 500;
  margin-bottom: 2px;
}

.font-size {
  font-size: 12px;
  color: #666;
}

/* Refactored Font Panel Content - no longer needs positioning styles */
.font-panel-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Search Box */
.search-container {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

/* Font Preview Area */
.font-preview-area {
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
  max-height: 150px;
  overflow: auto;
}

.preview-text {
  line-height: 1.5;
  white-space: normal;
  word-wrap: break-word;
  max-width: 100%;
}

/* Controls */
.font-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.slider-value {
  min-width: 60px;
  font-size: 14px;
  text-align: right;
}

/* Font Effects */
.font-effects {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.font-effects label {
  font-size: 14px;
  color: #666;
}

.effect-select {
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  font-size: 14px;
}

/* Font List */
.font-list-container {
  flex: 1;
  min-height: 150px;
  max-height: 250px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow-y: auto;
}

.font-list {
  display: flex;
  flex-direction: column;
}

.font-item {
  padding: 10px 12px;
  cursor: pointer;
  transition: background-color 0.1s;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.font-item:last-child {
  border-bottom: none;
}

.font-item:hover {
  background-color: #f0f8ff;
}

.font-item.selected {
  background-color: #e6f0fd;
  border-left: 3px solid #4a8bf5;
}

.font-item-name {
  font-size: 16px;
}

.font-item-category {
  font-size: 12px;
  color: #777;
}

/* Status Messages */
.no-results {
  padding: 20px;
  text-align: center;
  color: #666;
}
</style>