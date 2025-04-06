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
        <div class="font-size">{{ fontConfig.size }}px • {{ weightLabel }}</div>
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
          <div v-if="isLoading" class="loading-indicator">
            <span class="loading-spinner"></span>
          </div>
        </div>
        
        <!-- Font Preview -->
        <div class="font-preview-area" :style="previewAreaStyle">
          <div class="preview-text">Sphinx of black quartz, judge my vow</div>
        </div>
        
        <!-- Size and Weight Controls -->
        <div class="font-controls">
          <div class="control-group">
            <label>Size</label>
            <div class="slider-container">
              <input 
                type="range" 
                v-model.number="tempConfig.size" 
                min="8" 
                max="72" 
                step="1"
                class="slider"
              >
              <div class="slider-value">{{ tempConfig.size }}px</div>
            </div>
          </div>
          
          <div class="control-group">
            <label>Weight</label>
            <div class="slider-container">
              <input 
                type="range" 
                v-model.number="tempConfig.weight" 
                min="100" 
                max="900" 
                step="100"
                class="slider"
                :disabled="!currentFontSupportsWeights"
              >
              <div class="slider-value">{{ weightLabel }}</div>
            </div>
          </div>
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
          <div v-if="apiError" class="api-error">
            {{ apiError }}
          </div>
          
          <div v-else-if="isLoading && fonts.length === 0" class="loading-message">
            Loading fonts...
          </div>
          
          <div v-else-if="fonts.length === 0 && searchTerm.length > 0" class="no-results">
            No fonts found matching "{{ searchTerm }}".
          </div>
          
          <div v-else class="font-list">
            <div 
              v-for="font in fonts" 
              :key="font.family"
              class="font-item" 
              :class="{ 'selected': tempConfig.family === font.family }"
              @click="selectFont(font)"
              :style="{ fontFamily: `'${font.family}', ${font.category}` }"
            >
              <div class="font-item-name">{{ font.family }}</div>
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
// Cache for Google Fonts data to avoid repeated API calls
const fontsCache = {
  popular: null,
  all: null,
  search: {},
  lastFetched: 0
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
      isLoading: false,
      apiError: null,
      fonts: [],
      
      // Popular fonts to show as presets
      popularFonts: [
        { family: 'Roboto', category: 'sans-serif', variants: ['100', '300', '400', '500', '700', '900'] },
        { family: 'Open Sans', category: 'sans-serif', variants: ['300', '400', '600', '700', '800'] },
        { family: 'Lato', category: 'sans-serif', variants: ['100', '300', '400', '700', '900'] },
        { family: 'Montserrat', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
        { family: 'Merriweather', category: 'serif', variants: ['300', '400', '700', '900'] },
        { family: 'Raleway', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
        { family: 'Playfair Display', category: 'serif', variants: ['400', '500', '600', '700', '800', '900'] },
        { family: 'Source Code Pro', category: 'monospace', variants: ['200', '300', '400', '500', '600', '700', '900'] },
        { family: 'Poppins', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
        { family: 'Nunito', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800', '900'] }
      ],
      
      // Temporary configuration during editing
      tempConfig: {
        family: 'Roboto',
        category: 'sans-serif',
        size: 16,
        weight: 400,
        effect: 'none',
        variants: ['100', '300', '400', '500', '700', '900']
      },
      
      // Original configuration before editing
      originalConfig: {
        family: 'Roboto',
        category: 'sans-serif',
        size: 16,
        weight: 400,
        effect: 'none',
        variants: ['100', '300', '400', '500', '700', '900']
      },
      
      popupStyle: {
        top: '0px',
        left: '0px'
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
          variants: this.modelValue.variants || ['400']
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
          variants: ['400']
        };
      }
      
      return {
        family: 'Roboto',
        category: 'sans-serif',
        size: 16,
        weight: 400,
        effect: 'none',
        variants: ['400']
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
        fontWeight: this.fontConfig.weight
      };
    },
    
    // Style for the preview area in the popup
    previewAreaStyle() {
      return {
        fontFamily: `'${this.tempConfig.family}', ${this.tempConfig.category}`,
        fontWeight: this.tempConfig.weight,
        textTransform: this.tempConfig.effect === 'uppercase' ? 'uppercase' : 'none',
        fontVariantCaps: this.tempConfig.effect === 'small-caps' ? 'small-caps' : 'normal',
        textDecoration: this.getTextDecoration(),
        textShadow: this.getTextShadow(),
        backgroundColor: this.tempConfig.effect === 'highlight' ? 'rgba(255, 255, 0, 0.3)' : 'transparent'
      };
    },
    
    // Label for font weight (Thin, Light, Regular, etc.)
    weightLabel() {
      const weightMap = {
        100: 'Thin',
        200: 'Extra Light',
        300: 'Light',
        400: 'Regular',
        500: 'Medium',
        600: 'Semi Bold',
        700: 'Bold',
        800: 'Extra Bold',
        900: 'Black'
      };
      
      return weightMap[this.tempConfig.weight] || 'Regular';
    },
    
    // Check if the current font supports multiple weights
    currentFontSupportsWeights() {
      return this.tempConfig.variants && this.tempConfig.variants.length > 1;
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
    // Load the Google Fonts API
    this.loadGoogleFontsAPI();
    
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
    // Initialize component data from model value
    initFromModelValue() {
      // Parse the model value and set the temp configuration
      this.tempConfig = { ...this.fontConfig };
      this.originalConfig = { ...this.fontConfig };
      
      // Ensure the font is loaded for preview
      this.loadFont(this.tempConfig.family);
    },
    
    // Open the font selection panel
    openPanel() {
      this.initFromModelValue();
      this.searchTerm = '';
      this.calculatePopupPosition();
      
      // Load popular fonts if no search term
      this.fonts = [...this.popularFonts];
      
      // Fetch all fonts if needed and if cache is old
      const cacheAge = Date.now() - fontsCache.lastFetched;
      if (!fontsCache.all || cacheAge > 24 * 60 * 60 * 1000) {
        this.fetchAllFonts();
      }
      
      this.panelOpen = true;
      
      // Add a small delay to ensure the panel is rendered before positioning
      this.$nextTick(() => {
        this.calculatePopupPosition();
      });
    },
    
    // Calculate and set the popup position based on the trigger element
    calculatePopupPosition() {
      const triggerEl = this.$refs.fontPreview;
      if (!triggerEl) return;
      
      const triggerRect = triggerEl.getBoundingClientRect();
      const panelWidth = 400; // Fixed panel width
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
    
    // Load the Google Fonts API
    loadGoogleFontsAPI() {
      // Check if API is already loaded
      if (window.WebFontConfig) return;
      
      // Set up the API
      window.WebFontConfig = {
        google: {
          families: []
        },
        active: () => {
          // Fonts are loaded
        },
        inactive: () => {
          this.apiError = 'Failed to load Google Fonts.';
        }
      };
      
      // Load the WebFont loader script
      const wf = document.createElement('script');
      wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
      wf.async = true;
      document.head.appendChild(wf);
    },
    
    // Load a specific font
    loadFont(fontFamily) {
      if (!fontFamily) return;
      
      // Check if WebFont is loaded
      if (!window.WebFont) {
        // If not, try again in a moment
        setTimeout(() => this.loadFont(fontFamily), 100);
        return;
      }
      
      // Load the font
      window.WebFont.load({
        google: {
          families: [`${fontFamily}:100,200,300,400,500,600,700,800,900`]
        }
      });
    },
    
    // Fetch all fonts from Google Fonts API
    async fetchAllFonts() {
      // If we have a recent cache, use it
      if (fontsCache.all && (Date.now() - fontsCache.lastFetched < 24 * 60 * 60 * 1000)) {
        return fontsCache.all;
      }
      
      this.isLoading = true;
      this.apiError = null;
      
      try {
        const response = await fetch('https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyAOES8EmKhuJEnsn9kS1XKBpxxp-TgN8Jc&sort=popularity');
        const data = await response.json();
        
        // Check for API errors
        if (!data.items) {
          throw new Error('Invalid response from Google Fonts API');
        }
        
        // Process font data
        const fonts = data.items.map(font => ({
          family: font.family,
          category: font.category,
          variants: font.variants.filter(v => !v.includes('italic'))
        }));
        
        // Cache the results
        fontsCache.all = fonts;
        fontsCache.lastFetched = Date.now();
        
        return fonts;
      } catch (error) {
        this.apiError = 'Error loading fonts: ' + error.message;
        return [];
      } finally {
        this.isLoading = false;
      }
    },
    
    // Search fonts based on input
    async searchFonts() {
      if (this.searchTerm.length === 0) {
        // Show popular fonts if search is empty
        this.fonts = [...this.popularFonts];
        return;
      }
      
      // Check if we have this search in cache
      if (fontsCache.search[this.searchTerm]) {
        this.fonts = fontsCache.search[this.searchTerm];
        return;
      }
      
      // Get all fonts if needed
      let allFonts = fontsCache.all;
      if (!allFonts) {
        allFonts = await this.fetchAllFonts();
      }
      
      // Filter fonts based on search term
      const searchLower = this.searchTerm.toLowerCase();
      const results = allFonts.filter(font =>
        font.family.toLowerCase().includes(searchLower)
      );
      
      // Cache the search results
      fontsCache.search[this.searchTerm] = results;
      
      // Update the font list
      this.fonts = results;
    },
    
    // Select a font from the list
    selectFont(font) {
      // Update temp config
      this.tempConfig.family = font.family;
      this.tempConfig.category = font.category;
      this.tempConfig.variants = font.variants;
      
      // Adjust weight if current weight is not supported
      const weightStr = this.tempConfig.weight.toString();
      if (!font.variants.includes(weightStr)) {
        // Find closest available weight
        const weights = font.variants
          .filter(v => !isNaN(parseInt(v)))
          .map(v => parseInt(v))
          .sort((a, b) => a - b);
        
        if (weights.length > 0) {
          // Find the closest weight
          const closestWeight = weights.reduce((prev, curr) => 
            Math.abs(curr - this.tempConfig.weight) < Math.abs(prev - this.tempConfig.weight) ? curr : prev
          );
          this.tempConfig.weight = closestWeight;
        }
      }
      
      // Load the font for preview
      this.loadFont(font.family);
    },
    
    // Apply the selection
    applySelection() {
      // Create the result object
      const result = {
        family: this.tempConfig.family,
        category: this.tempConfig.category,
        size: this.tempConfig.size,
        weight: this.tempConfig.weight,
        effect: this.tempConfig.effect,
        variants: this.tempConfig.variants
      };
      
      // Emit the updated model value
      this.$emit('update:modelValue', result);
      this.panelOpen = false;
    },
    
    // Cancel and close the panel
    cancelSelection() {
      this.tempConfig = { ...this.originalConfig };
      this.panelOpen = false;
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

.loading-indicator {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Font Preview Area */
.font-preview-area {
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

.preview-text {
  font-size: 18px;
  line-height: 1.5;
  white-space: normal;
  word-wrap: break-word;
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

.slider:disabled {
  opacity: 0.5;
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
.api-error, .loading-message, .no-results {
  padding: 20px;
  text-align: center;
  color: #666;
}

.api-error {
  color: #e74c3c;
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
