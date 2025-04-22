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
      :visible="panelOpen"
      :title="label || 'Select Font'"
      :display-mode="displayMode"
      :target-element="$refs.fontPreview"
      :position="panelPosition"
      :size="panelSize"
      @update:size="panelSize = $event"  
      @close="cancelSelection"
      @apply="applySelection"
      @cancel="cancelSelection"
      @update:display-mode="updateDisplayMode"
      @update:position="updatePanelPosition"
      :debug="true"
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
            <div class="control-group" v-if="axis.tag !== 'opsz'">
              <label>{{ axis.tag === 'wdth' ? 'Width' : 
                        axis.tag === 'slnt' ? 'Slant' : 
                        axis.tag === 'ital' ? 'Italic' : 
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
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { FONTS } from '../../constants/fonts.js';
import InputDetailComponent from './InputDetailComponent.vue';

export default {
  name: 'FontInput',
  components: {
    InputDetailComponent
  },
  props: {
    modelValue: {
      type: Object,
      default: () => ({
        family: 'Roboto',
        category: 'sans-serif',
        size: 16,
        weight: 400,
        effect: 'none',
        axes: {}
      })
    },
    label: { 
      type: String, 
      default: '' 
    },
    size: { 
      type: String, 
      default: 'regular' 
    },
    defaultDisplayMode: { 
      type: String, 
      default: 'popup' 
    },
    debug: { 
      type: Boolean, 
      default: false 
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
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

    // Safe access to modelValue with defaults
    const fontConfig = computed(() => {
      const defaultConfig = {
        family: 'Roboto',
        category: 'sans-serif',
        size: 16,
        weight: 400,
        effect: 'none',
        axes: {}
      };
      
      if (!props.modelValue) return defaultConfig;
      
      return {
        ...defaultConfig,
        ...props.modelValue
      };
    });

    // Reactive state variables
    const panelOpen = ref(false);
    const displayMode = ref(props.defaultDisplayMode);
    const panelPosition = ref({ top: '0px', left: '0px' });
    const panelSize = ref({ width: '450px', height: '600px' });
    const searchTerm = ref('');
    const fonts = ref([]);
    const allFonts = ref([]); // To store all fonts for filtering
    const fontInputContainer = ref(null);
    const fontPreview = ref(null);
    const previewText = ref(null);

    // Temporary configuration during editing
    const tempConfig = ref({
      family: 'Roboto',
      category: 'sans-serif',
      size: 16,
      weight: 400,
      effect: 'none',
      axes: {}
    });

    // Original configuration before editing
    const originalConfig = ref({
      family: 'Roboto',
      category: 'sans-serif',
      size: 16,
      weight: 400,
      effect: 'none',
      axes: {}
    });

    // Weight labels
    const weightLabels = {
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

    // Safe weight label that handles null tempConfig
    const safeWeightLabel = computed(() => {
      if (!tempConfig.value) {
        return weightLabels[400] || 'Regular'; // Default when tempConfig is null
      }
      
      const weight = tempConfig.value.weight;
      return weightLabels[weight] || approximateWeightLabel(weight);
    });

    // Get the currently selected font info
    const selectedFontInfo = computed(() => {
      if (!tempConfig.value || !tempConfig.value.family) return null;
      return FONTS[tempConfig.value.family] || null;
    });

    // Available weights for the selected font (for non-variable fonts)
    const availableWeights = computed(() => {
      if (!selectedFontInfo.value) return ["400"];
      return selectedFontInfo.value.weights || ["400"];
    });

    // Additional axes for variable fonts (excluding weight)
    const additionalAxes = computed(() => {
      if (!selectedFontInfo.value || !selectedFontInfo.value.isVariable || !selectedFontInfo.value.axes) {
        return [];
      }
      
      return selectedFontInfo.value.axes.filter(axis => axis.tag !== 'wght');
    });

    // Display name for the font
    const displayFontName = computed(() => {
      return fontConfig.value.family || 'Select Font';
    });

    // Style for the preview button
    const previewStyle = computed(() => {
      return {
        fontFamily: `'${fontConfig.value.family}', ${fontConfig.value.category}`,
        fontWeight: fontConfig.value.weight,
        fontVariationSettings: getVariationSettingsFromConfig(fontConfig.value)
      };
    });

    // Initialize data
    const initData = () => {
      // Convert FONTS object to array for easier filtering
      allFonts.value = Object.entries(FONTS).map(([family, info]) => ({
        family,
        category: info.category || 'sans-serif',
        weights: info.weights || ['400'],
        isVariable: info.isVariable || false,
        axes: info.axes || []
      }));
      
      // Initial font list (top fonts)
      fonts.value = getTopFonts();
    };

    // Initialize from model value
    const initFromModelValue = () => {
      // Initialize with a safe copy of current value
      const currentValue = {
        ...fontConfig.value
      };
      
      // Deep copy the axes
      currentValue.axes = { ...(fontConfig.value.axes || {}) };
      
      // Store original config for cancel operation
      originalConfig.value = JSON.parse(JSON.stringify(currentValue));
      
      // Set the temporary config (used during editing)
      tempConfig.value = JSON.parse(JSON.stringify(currentValue));
    };

    // Get a curated list of top fonts (mix of sans-serif and serif)
    const getTopFonts = () => {
      // Define a list of popular font families
      const popularFamilies = [
        'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro',
        'Merriweather', 'Playfair Display', 'Raleway', 'Poppins', 'Nunito',
        'Roboto Condensed', 'Oswald', 'Inter', 'Noto Sans', 'Lora',
        'PT Sans', 'Roboto Mono', 'Ubuntu', 'Fira Sans', 'Mukta'
      ];
      
      // Filter the allFonts array to include only fonts from the popularFamilies list
      const topFonts = allFonts.value.filter(font => 
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
    };

    // Preload fonts for the visible list items
    const preloadListFonts = async () => {
      // Preload first 20 fonts for better user experience
      const fontsToPreload = fonts.value.slice(0, 20);
      
      // Load fonts in parallel but with a small delay between each to avoid rate limiting
      const loadPromises = [];
      
      for (const font of fontsToPreload) {
        const loadPromise = loadFont(font.family);
        loadPromises.push(loadPromise);
        
        // Small delay between font loading requests
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Wait for all fonts to load
      await Promise.all(loadPromises);
      console.log('All preview fonts loaded');
    };

    // Load a specific font with appropriate weights and variations
    const loadFont = async (fontFamily) => {
      if (!fontFamily) return;
      
      const fontInfo = FONTS[fontFamily];
      if (!fontInfo) return;
      
      try {
        // For variable fonts, we need to include the axis ranges in the URL
        let fontURL = fontFamily.replace(/ /g, '+');
        
        // Build comma-separated weight list for non-variable fonts
        let weightsParam = '';
        if (fontInfo.weights && fontInfo.weights.length) {
          weightsParam = fontInfo.weights.join(',');
        } else {
          // Default weights if none specified
          weightsParam = '400,700';
        }
        
        // For variable fonts, handle axis ranges
        let axisParams = '';
        if (fontInfo.isVariable && fontInfo.axes) {
          // Add axis ranges to the URL
          axisParams = fontInfo.axes.map(axis => {
            return `${axis.tag},${axis.start}..${axis.end}`;
          }).join(';');
        }
        
        // Build the final font URL
        if (axisParams) {
          fontURL += `:${axisParams}`;
        } else if (weightsParam) {
          fontURL += `:${weightsParam}`;
        }
        
        console.log('Loading font:', fontURL);
        
        return new Promise((resolve, reject) => {
          // Use WebFont to load the font
          if (typeof window.WebFont !== 'undefined') {
            window.WebFont.load({
              google: {
                families: [fontURL]
              },
              active: () => {
                console.log('Font loaded successfully:', fontFamily);
                resolve();
              },
              inactive: () => {
                console.warn('Failed to load font:', fontFamily);
                // Resolve anyway to prevent blocking
                resolve();
              },
              timeout: 2000 // 2 second timeout
            });
          } else {
            // If WebFont is not available, use a link element as fallback
            const linkId = `font-link-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`;
            let link = document.getElementById(linkId);
            
            if (!link) {
              link = document.createElement('link');
              link.id = linkId;
              link.rel = 'stylesheet';
              link.href = `https://fonts.googleapis.com/css2?family=${fontURL}&display=swap`;
              document.head.appendChild(link);
              
              // Wait for font to load
              link.onload = () => {
                console.log('Font loaded via link:', fontFamily);
                resolve();
              };
              
              link.onerror = () => {
                console.warn('Failed to load font via link:', fontFamily);
                resolve(); // Resolve anyway to prevent blocking
              };
            } else {
              // Link already exists, consider it loaded
              resolve();
            }
          }
        });
      } catch (error) {
        console.error('Error loading font:', error);
        // Return resolved promise to prevent blocking
        return Promise.resolve();
      }
    };

    // Open the font selection panel
    const openPanel = async () => {
      initFromModelValue();
      searchTerm.value = '';
      
      // Show only top fonts initially instead of all fonts
      fonts.value = getTopFonts();
      
      // First open the panel so the user sees something happening
      panelOpen.value = true;
      
      // Then load the fonts in the background
      setTimeout(async () => {
        try {
          await preloadListFonts();
          
          // Make sure current font is loaded
          if (tempConfig.value && tempConfig.value.family) {
            await loadFont(tempConfig.value.family);
            updatePreviewStyle();
          }
        } catch (error) {
          console.error('Error loading fonts:', error);
        }
      }, 100);
    };

    // Search fonts based on input
    const searchFonts = () => {
      if (searchTerm.value.length === 0) {
        // Show all fonts if search is empty
        fonts.value = [...allFonts.value];
        return;
      }
      
      // Filter fonts based on search term
      const searchLower = searchTerm.value.toLowerCase();
      fonts.value = allFonts.value.filter(font =>
        font.family.toLowerCase().includes(searchLower)
      );
      
      // Preload search results
      nextTick(() => {
        preloadListFonts();
      });
    };

    // Select a font from the list
    const selectFont = async (font) => {
      if (!font || !tempConfig.value) return;
      
      try {
        console.log(`Selecting font: ${font.family}`);
        
        // Update basic properties
        tempConfig.value.family = font.family;
        tempConfig.value.category = font.category;
        
        const fontInfo = FONTS[font.family];
        if (!fontInfo) {
          console.warn(`No font info found for ${font.family}`);
          return;
        }
        
        console.log(`Font info for ${font.family}:`, 
               `variable: ${!!fontInfo.isVariable}`, 
               `axes: ${fontInfo.axes ? fontInfo.axes.length : 'none'}`,
               `weights: ${fontInfo.weights ? fontInfo.weights.join(',') : 'none'}`);
        
        // Reset axes
        tempConfig.value.axes = {};
        
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
              const weight = Math.min(Math.max(tempConfig.value.weight, axis.start), axis.end);
              tempConfig.value.weight = weight;
            } else if (axis.tag === 'opsz') {
              // Special case for optical size - set to match font size
              const opticalSize = Math.max(axis.start, Math.min(tempConfig.value.size, axis.end));
              tempConfig.value.axes[axis.tag] = opticalSize;
            } else {
              // Set other axes
              console.log(`Setting axis ${axis.tag} to ${defaultValue}`);
              tempConfig.value.axes[axis.tag] = defaultValue;
            }
          }
        } else if (Array.isArray(fontInfo.weights) && fontInfo.weights.length > 0) {
          console.log(`Processing standard font weights for ${font.family}`);
          // For non-variable fonts, adjust to nearest available weight
          const weights = fontInfo.weights.map(w => parseInt(w));
          tempConfig.value.weight = findClosestWeight(weights, tempConfig.value.weight);
        }
        
        // Load the font for preview
        await loadFont(font.family);
        
        // Update preview
        updatePreviewStyle();
      } catch (error) {
        console.error('Error in selectFont:', error);
      }
    };

    // Find closest available weight
    const findClosestWeight = (weights, targetWeight) => {
      if (!weights || weights.length === 0) return 400;
      return weights.reduce((prev, curr) => 
        Math.abs(curr - targetWeight) < Math.abs(prev - targetWeight) ? curr : prev
      );
    };

    // Get weight step for non-variable fonts
    const getWeightStep = () => {
      if (!availableWeights.value || availableWeights.value.length <= 1) return 100;
      
      // Sort weights in ascending order
      const weights = [...availableWeights.value].map(w => parseInt(w)).sort((a, b) => a - b);
      
      // Calculate minimum difference between consecutive weights
      let minDiff = 100;
      for (let i = 1; i < weights.length; i++) {
        const diff = weights[i] - weights[i-1];
        if (diff < minDiff) minDiff = diff;
      }
      
      return minDiff;
    };

    // Apply the selection
    const applySelection = () => {
      if (!tempConfig.value) return;
      
      // Create the result object
      const result = {
        family: tempConfig.value.family,
        category: tempConfig.value.category,
        size: tempConfig.value.size,
        weight: tempConfig.value.weight,
        effect: tempConfig.value.effect
      };
      
      // Add axes if there are any
      if (tempConfig.value.axes && Object.keys(tempConfig.value.axes).length > 0) {
        result.axes = { ...tempConfig.value.axes };
      }
      
      // Emit the updated model value
      emit('update:modelValue', result);
      panelOpen.value = false;
    };

    // Cancel and close the panel
    const cancelSelection = () => {
      if (!tempConfig.value) {
        panelOpen.value = false;
        return;
      }
      
      // Reset to original config
      tempConfig.value = JSON.parse(JSON.stringify(originalConfig.value));
      panelOpen.value = false;
    };

    // Helper methods for style computation
    const getTextDecoration = () => {
      if (!tempConfig.value) return 'none';
      if (tempConfig.value.effect === 'underline') return 'underline';
      if (tempConfig.value.effect === 'strikethrough') return 'line-through';
      return 'none';
    };

    const getTextShadow = () => {
      if (!tempConfig.value) return 'none';
      if (tempConfig.value.effect === 'shadow') return '1px 1px 2px rgba(0,0,0,0.3)';
      if (tempConfig.value.effect === 'drop-shadow') return '2px 2px 4px rgba(0,0,0,0.5)';
      return 'none';
    };

    // Get the computed style for the preview text
    const getPreviewStyle = () => {
      if (!tempConfig.value) return {};
      
      // Start with basic style properties
      const style = {
        fontFamily: `'${tempConfig.value.family}', ${tempConfig.value.category}`,
        fontSize: `${tempConfig.value.size}pt`,
        textTransform: tempConfig.value.effect === 'uppercase' ? 'uppercase' : 'none',
        fontVariantCaps: tempConfig.value.effect === 'small-caps' ? 'small-caps' : 'normal',
        textDecoration: getTextDecoration(),
        textShadow: getTextShadow(),
        backgroundColor: tempConfig.value.effect === 'highlight' ? 'rgba(255, 255, 0, 0.3)' : 'transparent'
      };
      
      // Apply font-weight from the tempConfig
      style.fontWeight = tempConfig.value.weight;
      
      // Apply specific CSS properties for each axis if they exist in tempConfig.axes
      if (tempConfig.value.axes) {
        // Width (wdth) → font-stretch
        if (tempConfig.value.axes.wdth !== undefined) {
          // font-stretch accepts percentage values
          style.fontStretch = `${tempConfig.value.axes.wdth}%`;
        }
        
        // Italic (ital) → font-style
        if (tempConfig.value.axes.ital !== undefined) {
          // ital is typically 0 to 1, where 1 is italic
          style.fontStyle = tempConfig.value.axes.ital > 0.5 ? 'italic' : 'normal';
        }
        
        // Slant (slnt) → font-style with oblique
        if (tempConfig.value.axes.slnt !== undefined) {
          // slnt is typically negative for backwards slant
          style.fontStyle = `oblique ${tempConfig.value.axes.slnt}deg`;
        }
      }
      
      // Add font-variation-settings if this is a variable font
      if (selectedFontInfo.value && selectedFontInfo.value.isVariable) {
        const variationSettings = getVariationSettings();
        if (variationSettings) {
          style.fontVariationSettings = variationSettings;
        }
      }
      
      return style;
    };

    // Get CSS font-variation-settings string for variable fonts
    const getVariationSettings = () => {
      try {
        if (!tempConfig.value || !selectedFontInfo.value || !selectedFontInfo.value.isVariable) {
          return '';
        }
        
        let settings = `"wght" ${tempConfig.value.weight}`;
        
        // Safely access axes properties
        if (tempConfig.value.axes) {
          const axisEntries = Object.entries(tempConfig.value.axes);
          
          for (let i = 0; i < axisEntries.length; i++) {
            const [tag, value] = axisEntries[i];
            if (tag !== 'wght') { // Skip wght as it's already included
              settings += `, "${tag}" ${value}`;
            }
          }
        }
        
        return settings;
      } catch (error) {
        console.error('Error in getVariationSettings:', error);
        return '';
      }
    };

    // Get variation settings from a config object
    const getVariationSettingsFromConfig = (config) => {
      if (!config || !config.family) return '';
      
      const fontInfo = FONTS[config.family];
      if (!fontInfo || !fontInfo.isVariable) return '';
      
      let settings = `"wght" ${config.weight || 400}`;
      
      // Add other axes
      if (config.axes) {
        for (const [tag, value] of Object.entries(config.axes)) {
          if (tag !== 'wght') { // Skip wght as it's already included
            settings += `, "${tag}" ${value}`;
          }
        }
      }
      
      return settings;
    };

    // Get the minimum value for an axis
    const getAxisMin = (tag) => {
      if (!selectedFontInfo.value || !selectedFontInfo.value.isVariable || !selectedFontInfo.value.axes) {
        return tag === 'wght' ? 400 : 0;
      }
      
      const axis = selectedFontInfo.value.axes.find(a => a.tag === tag);
      return axis ? axis.start : (tag === 'wght' ? 400 : 0);
    };

    // Get the maximum value for an axis
    const getAxisMax = (tag) => {
      if (!selectedFontInfo.value || !selectedFontInfo.value.isVariable || !selectedFontInfo.value.axes) {
        return tag === 'wght' ? 700 : 100;
      }
      
      const axis = selectedFontInfo.value.axes.find(a => a.tag === tag);
      return axis ? axis.end : (tag === 'wght' ? 700 : 100);
    };

    // Update axis value with manual event handling
    const updateAxisValue = (tag, value) => {
      if (!tempConfig.value || !tempConfig.value.axes) return;
      
      // Convert to number
      const numValue = parseFloat(value);
      
      console.log(`Updating axis ${tag} to ${numValue}`);
      
      // Set the value
      tempConfig.value.axes[tag] = numValue;
      
      // Update the preview immediately
      updatePreviewStyle();
    };

    // Get a weight label for any weight value (including non-standard weights)
    const approximateWeightLabel = (weight) => {
      if (typeof weight !== 'number') return 'Regular';
      
      // Find the closest standard weight
      const standardWeights = [100, 200, 300, 400, 500, 600, 700, 800, 900];
      let closestWeight = standardWeights.reduce((prev, curr) => 
        Math.abs(curr - weight) < Math.abs(prev - weight) ? curr : prev
      );
      
      return weightLabels[closestWeight] || `Weight ${weight}`;
    };

    // Get a good preview weight for a font in the list
    const getFontPreviewWeight = (font) => {
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
        if (weights.includes('400')) return 400;
        if (weights.includes('500')) return 500;
        if (weights.includes('700')) return 700;
        return parseInt(weights[Math.floor(weights.length / 2)]);
      }
      
      return 400; // Default
    };

    // Update the preview style immediately
    const updatePreviewStyle = () => {
      nextTick(() => {
        if (previewText.value) {
          const style = getPreviewStyle();
          Object.entries(style).forEach(([prop, value]) => {
            previewText.value.style[prop] = value;
          });
        }
      });
    };

    // Get optical size axis if available
    const opticalSizeAxis = computed(() => {
      if (!selectedFontInfo.value || !selectedFontInfo.value.isVariable || !selectedFontInfo.value.axes) {
        return null;
      }
      
      return selectedFontInfo.value.axes.find(axis => axis.tag === 'opsz');
    });

    // Update display mode and position
    const updateDisplayMode = (newMode) => {
      displayMode.value = newMode;
    };

    const updatePanelPosition = (newPosition) => {
      panelPosition.value = newPosition;
    };

    // Watch for model changes
    watch(() => props.modelValue, (newValue) => {
      // Only update if panel is closed to avoid breaking the editing session
      if (!panelOpen.value && newValue) {
        initFromModelValue();
      }
    }, { deep: true });

    // Initialize on mount
    onMounted(() => {
      // Initialize data
      initData();
      initFromModelValue();
      
      // Load WebFont if not already available
      if (typeof window.WebFont === 'undefined') {
        const wf = document.createElement('script');
        wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
        wf.async = true;
        document.head.appendChild(wf);
        
        wf.onload = () => {
          console.log('WebFont loader loaded');
          // Load initial font
          if (fontConfig.value && fontConfig.value.family) {
            loadFont(fontConfig.value.family).then(() => {
              console.log('Initial font loaded');
            });
          }
        };
      } else if (fontConfig.value && fontConfig.value.family) {
        // WebFont already available, load initial font
        loadFont(fontConfig.value.family).then(() => {
          console.log('Initial font loaded');
        });
      }
    });

    return {
      // Refs
      fontConfig,
      panelOpen,
      displayMode,
      panelPosition,
      panelSize,
      searchTerm,
      fonts,
      tempConfig,
      originalConfig,
      fontInputContainer,
      fontPreview,
      previewText,
      
      // Computed
      selectedFontInfo,
      availableWeights,
      additionalAxes,
      displayFontName,
      previewStyle,
      safeWeightLabel,
      opticalSizeAxis,
      
      // Methods
      openPanel,
      searchFonts,
      selectFont,
      applySelection,
      cancelSelection,
      getPreviewStyle,
      getAxisMin,
      getAxisMax,
      updateAxisValue,
      getFontPreviewWeight,
      getWeightStep,
      updateDisplayMode,
      updatePanelPosition
    };
  }
}
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
  height: 100%;
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
  min-height: 100px;
  /* Removed max-height to allow flexible sizing */
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