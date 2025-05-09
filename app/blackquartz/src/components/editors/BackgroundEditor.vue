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
        <div class="font-size">{{ fontConfig.size }}pt • {{ weightLabel }}</div>
      </div>
    </div>
    
    <!-- Font Panel Popup -->
    <div 
      v-if="panelOpen" 
      class="font-panel-popup" 
      :style="popupStyle"
      ref="fontPanel"
    >
      <div class="panel-header">
        <h3>{{ label || 'Select Font' }}</h3>
        <button class="close-btn" @click="cancelSelection">×</button>
      </div>
      
      <div class="panel-body">
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
            :style="{
              fontFamily: `'${tempConfig.family}', ${tempConfig.category}`,
              fontSize: `${tempConfig.size}pt`,
              fontVariationSettings: getVariationSettings(),
              // Only set fontWeight if we're not using variable font settings
              ...(getVariationSettings() ? {} : { fontWeight: tempConfig.weight }),
              textTransform: tempConfig.effect === 'uppercase' ? 'uppercase' : 'none',
              fontVariantCaps: tempConfig.effect === 'small-caps' ? 'small-caps' : 'normal',
              textDecoration: getTextDecoration(),
              textShadow: getTextShadow(),
              backgroundColor: tempConfig.effect === 'highlight' ? 'rgba(255, 255, 0, 0.3)' : 'transparent'
            }"
          >
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
              <div class="slider-value">{{ weightLabel }}</div>
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
                  v-model.number="tempConfig.axes[axis.tag]"
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
      
      <div class="panel-footer">
        <button class="btn cancel" @click="cancelSelection">Cancel</button>
        <button class="btn apply" @click="applySelection">Apply</button>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive } from 'vue';
import { FONTS } from '../../constants/fonts.js';

// Font loader helper
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
  props: {
    modelValue: { required: true },
    label: String,
    size: { type: String, default: 'regular' } // 'regular' or 'large'
  },
  emits: ['update:modelValue'],
  data() {
    return {
      panelOpen: false,
      searchTerm: '',
      fonts: [],
      allFonts: [],
      
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
      
      popupStyle: {
        top: '0px',
        left: '0px'
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
    
    // Weight label based on current weight value
    weightLabel() {
      const weight = this.tempConfig.weight;
      return this.weightLabels[weight] || this.approximateWeightLabel(weight);
    },
    
    // Get the currently selected font info
    selectedFontInfo() {
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
        this.initFromModelValue();
      },
      immediate: true
    }
  },
  mounted() {
    // Initialize all fonts from the FONTS object
    this.initializeFonts();
    
    // Add click outside listener to close the panel
    document.addEventListener('mousedown', this.handleClickOutside);
    
    // Add resize listener to reposition panel if window size changes
    window.addEventListener('resize', this.handleResize);
    
    // Add scroll listener for all parent elements
    this.addScrollListeners();
    
    // Initialize WebFont loader
    this.initWebFontLoader();
    
    // Initialize tempConfig with proper reactivity
    this.tempConfig = reactive({
      family: 'Roboto',
      category: 'sans-serif',
      size: 16,
      weight: 400,
      effect: 'none',
      axes: {}
    });
  },
  
  beforeUnmount() {
    // Remove event listeners
    document.removeEventListener('mousedown', this.handleClickOutside);
    window.removeEventListener('resize', this.handleResize);
    this.removeScrollListeners();
  },
  methods: {
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
        // Update individual properties instead of replacing the entire object
        this.tempConfig.family = this.fontConfig.family || 'Roboto';
        this.tempConfig.category = this.fontConfig.category || 'sans-serif';
        this.tempConfig.size = this.fontConfig.size || 16;
        this.tempConfig.weight = this.fontConfig.weight || 400;
        this.tempConfig.effect = this.fontConfig.effect || 'none';
        
        // Clear existing axes safely
        if (this.tempConfig.axes) {
          const keys = Object.keys(this.tempConfig.axes);
          for (let i = 0; i < keys.length; i++) {
            delete this.tempConfig.axes[keys[i]];
          }
        }
        
        // Copy axes safely
        if (this.fontConfig.axes) {
          const entries = Object.entries(this.fontConfig.axes);
          for (let i = 0; i < entries.length; i++) {
            const [key, value] = entries[i];
            if (this.tempConfig.axes) {
              this.tempConfig.axes[key] = value;
            }
          }
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
          const entries = Object.entries(this.fontConfig.axes);
          for (let i = 0; i < entries.length; i++) {
            const [key, value] = entries[i];
            this.originalConfig.axes[key] = value;
          }
        }
        
        // Ensure the font is loaded for preview
        this.loadFont(this.tempConfig.family);
      } catch (error) {
        console.error('Error in initFromModelValue:', error);
      }
    },
    
    // Open the font selection panel
    openPanel() {
      this.initFromModelValue();
      this.searchTerm = '';
      this.calculatePopupPosition();
      
      // Show only top fonts initially instead of all fonts
      this.fonts = this.getTopFonts();
      
      // Load fonts for the list
      this.preloadListFonts();
      
      this.panelOpen = true;
      
      // Add a small delay to ensure the panel is rendered before positioning
      this.$nextTick(() => {
        this.calculatePopupPosition();
      });
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
    
    // Calculate and set the popup position based on the trigger element
    calculatePopupPosition() {
      const triggerEl = this.$refs.fontPreview;
      if (!triggerEl) return;
      
      const triggerRect = triggerEl.getBoundingClientRect();
      const panelHeight = 500; // Estimated panel height
      
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
      } else {
        // Position below the trigger element
        this.popupStyle = {
          top: `${triggerRect.bottom + offsetY}px`,
          left: `${triggerRect.left}px`,
          bottom: 'auto'
        };
      }
      
      // After setting initial position, check if it goes off-screen horizontally
      this.$nextTick(() => {
        const panel = this.$refs.fontPanel;
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
    
    // Handle clicks outside the component to close the panel
    handleClickOutside(event) {
      const fontPanel = this.$refs.fontPanel;
      const fontPreview = this.$refs.fontPreview;
      
      if (this.panelOpen && fontPanel && fontPreview) {
        if (!fontPanel.contains(event.target) && !fontPreview.contains(event.target)) {
          this.cancelSelection();
        }
      }
    },
    
    // Handle window resize
    handleResize() {
      if (this.panelOpen) {
        this.calculatePopupPosition();
      }
    },
    
    // Add scroll listeners to parent elements
    addScrollListeners() {
      let parent = this.$el && this.$el.parentElement;
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
      // Update temp config
      this.tempConfig.family = font.family;
      this.tempConfig.category = font.category;
      
      const fontInfo = FONTS[font.family];
      
      // Reset axes configuration
      this.tempConfig.axes = {};
      
      // Handle variable font axes
      if (fontInfo && fontInfo.isVariable && fontInfo.axes) {
        // Initialize axes with default values
        fontInfo.axes.forEach(axis => {
          const defaultValue = Math.round((axis.start + axis.end) / 2);
          
          // Special case for weight - use the current weight if within range
          if (axis.tag === 'wght') {
            const weight = Math.min(Math.max(this.tempConfig.weight, axis.start), axis.end);
            this.tempConfig.weight = weight;
          } else {
            // Initialize all other axes with their default values
            if (!this.tempConfig.axes) this.tempConfig.axes = {};
            this.tempConfig.axes[axis.tag] = defaultValue;
          }
        });
      } else if (fontInfo) {
        // For non-variable fonts, adjust to nearest available weight
        const weights = fontInfo.weights.map(w => parseInt(w));
        if (weights.length > 0) {
          // Find closest available weight
          this.tempConfig.weight = this.findClosestWeight(weights, this.tempConfig.weight);
        }
      }
      
      // Load the font for preview
      this.loadFont(font.family);
      
      // Force update
      this.$forceUpdate();
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
      // Create the result object
      const result = {
        family: this.tempConfig.family,
        category: this.tempConfig.category,
        size: this.tempConfig.size,
        weight: this.tempConfig.weight,
        effect: this.tempConfig.effect
      };
      
      // Add axes if there are any
      if (Object.keys(this.tempConfig.axes).length > 0) {
        result.axes = { ...this.tempConfig.axes };
      }
      
      // Emit the updated model value
      this.$emit('update:modelValue', result);
      this.panelOpen = false;
    },
    
    // Cancel and close the panel
    cancelSelection() {
      try {
        // Update from originalConfig, property by property
        this.tempConfig.family = this.originalConfig.family;
        this.tempConfig.category = this.originalConfig.category;
        this.tempConfig.size = this.originalConfig.size;
        this.tempConfig.weight = this.originalConfig.weight;
        this.tempConfig.effect = this.originalConfig.effect;
        
        // Clear existing axes safely
        if (this.tempConfig.axes) {
          const keys = Object.keys(this.tempConfig.axes);
          for (let i = 0; i < keys.length; i++) {
            delete this.tempConfig.axes[keys[i]];
          }
        }
        
        // Copy axes from originalConfig
        if (this.originalConfig.axes) {
          const entries = Object.entries(this.originalConfig.axes);
          for (let i = 0; i < entries.length; i++) {
            const [key, value] = entries[i];
            if (this.tempConfig.axes) {
              this.tempConfig.axes[key] = value;
            }
          }
        }
        
        this.panelOpen = false;
      } catch (error) {
        console.error('Error in cancelSelection:', error);
        this.panelOpen = false;
      }
    },
    
    // Helper methods for style computation
    getTextDecoration() {
      if (this.tempConfig.effect === 'underline') return 'underline';
      if (this.tempConfig.effect === 'strikethrough') return 'line-through';
      return 'none';
    },
    
    getTextShadow() {
      if (this.tempConfig.effect === 'shadow') return '1px 1px 2px rgba(0,0,0,0.3)';
      if (this.tempConfig.effect === 'drop-shadow') return '2px 2px 4px rgba(0,0,0,0.5)';
      return 'none';
    },
    
    // Get CSS font-variation-settings string for variable fonts
    getVariationSettings() {
      try {
        if (!this.selectedFontInfo || !this.selectedFontInfo.isVariable) {
          return '';
        }
        
        let settings = `"wght" ${this.tempConfig.weight}`;
        
        // Safely access axes properties
        if (this.tempConfig.axes) {
          const axisEntries = Object.entries(this.tempConfig.axes);
          for (let i = 0; i < axisEntries.length; i++) {
            const [tag, value] = axisEntries[i];
            if (tag !== 'wght') { // Skip wght as it's already included
              settings += `, "${tag}" ${value}`;
            }
          }
        }
        
        // Safely add any missing axes with default values
        if (this.selectedFontInfo.axes && Array.isArray(this.selectedFontInfo.axes)) {
          for (let i = 0; i < this.selectedFontInfo.axes.length; i++) {
            const axis = this.selectedFontInfo.axes[i];
            if (axis && axis.tag && axis.tag !== 'wght' && 
                (!this.tempConfig.axes || this.tempConfig.axes[axis.tag] === undefined)) {
              const defaultValue = Math.round((axis.start + axis.end) / 2);
              settings += `, "${axis.tag}" ${defaultValue}`;
              
              // Initialize the axis in tempConfig if it exists
              if (this.tempConfig.axes) {
                this.tempConfig.axes[axis.tag] = defaultValue;
              }
            }
          }
        }
        
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
    
    // Get step size for an axis slider
    getAxisStep(tag) {
      // Weight typically uses steps of 1, width might use steps of 0.1 or 1 depending on range
      return tag === 'wght' ? 1 : 1;
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
    },
    
    // Get weight label for a specific weight value
    getWeightLabel(weight) {
      return this.weightLabels[weight] || `${weight}`;
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
  padding: 8px 12px;
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
  padding: 12px 16px;
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

/* Font Panel Popup */
.font-panel-popup {
  position: fixed;
  width: 400px;
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
  padding: 12px 16px;
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
  padding: 16px;
  overflow-y: auto;
  max-height: 60vh;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #eee;
  background-color: #f9f9f9;
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
  gap: 10px;
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

/* Weight Select */
.weight-select-container {
  width: 100%;
}

.weight-select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  font-size: 14px;
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