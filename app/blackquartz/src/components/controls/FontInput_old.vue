  <!-- 
  FontInput Component
  ==================
  A comprehensive font selection and configuration component for theme designers.
  
  Features:
  - Font family selection with search functionality
  - Font size and weight controls
  - Support for variable fonts with axis controls
  - Automatic optical size (opsz) adaptation to font size
  - Text effect options (uppercase, small caps, shadows, etc.)
  - Live preview of font settings
  - Seamless Google Fonts integration

  Usage:
  <FontInput 
    v-model="fontConfig"         // Bind to a font configuration object
    label="Heading Font"         // Optional label
    size="large"                 // Optional size variant ('regular' or 'large')
    :default-display-mode="mode" // Optional display mode ('popup', 'modal', 'tearoff', 'panel')
  />
  
  The v-model object format:
  {
    family: "Font Family Name",   // Font family name
    category: "serif",            // Font category (serif, sans-serif, etc.)
    size: 16,                     // Font size in points
    weight: 400,                  // Font weight (100-900)
    effect: "none",               // Text effect (none, uppercase, shadow, etc.)
    axes: {}                      // Optional variable font axes settings
  }
  -->
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

/**
 * FontInput
 * =========
 * A comprehensive font selection and configuration component for theme designers.
 * Provides an intuitive interface for font selection with real-time preview and
 * advanced configuration options including variable font support.
 * 
 * FEATURES:
 * - Font family selection with search functionality
 * - Font size and weight controls
 * - Support for variable fonts with axis controls
 * - Automatic optical size (opsz) adaptation to font size
 * - Text effect options (uppercase, small caps, shadows, etc.)
 * - Live preview of font settings
 * - Seamless Google Fonts integration
 * 
 * BASIC USAGE:
 * ```vue
 * <FontInput 
 *   v-model="fontConfig"
 *   label="Heading Font"
 *   size="large"
 * />
 * ```
 * 
 * PROPS:
 * @prop {Object} modelValue - Font configuration object (required)
 * @prop {String} label - Label for the component (displays in UI and preview)
 * @prop {String} size - UI size variant: 'regular' or 'large' (default: 'regular')
 * @prop {String} defaultDisplayMode - Initial display mode: 'popup', 'modal', 'tearoff', 'panel' (default: 'popup')
 * 
 * EVENTS:
 * @emits {update:modelValue} - When font configuration changes
 * 
 * MODEL VALUE FORMAT:
 * The component expects and returns a configuration object:
 * {
 *   family: "Font Family Name",   // Font family name
 *   category: "serif",            // Font category (serif, sans-serif, etc.)
 *   size: 16,                     // Font size in points
 *   weight: 400,                  // Font weight (100-900)
 *   effect: "none",               // Text effect (none, uppercase, shadow, etc.)
 *   axes: {}                      // Optional variable font axes settings
 * }
 * 
 * FONT EFFECTS:
 * - none: No special effect
 * - uppercase: All capital letters
 * - small-caps: Small capitals
 * - highlight: Yellow highlighted background
 * - shadow: Subtle text shadow
 * - drop-shadow: Stronger drop shadow
 * - underline: Underlined text
 * - strikethrough: Strike-through text
 * - drop-cap: First letter as a larger drop cap (preview only)
 * 
 * INTERNAL BEHAVIOR:
 * - Uses WebFont loader to dynamically load Google Fonts
 * - Handles variable font axes with appropriate defaults
 * - Automatically matches optical size to font size when supported
 * - Maintains temporary configuration during editing sessions
 * - Uses InputDetailComponent for the configuration panel
 * - Intelligently limits font selection to available weights
 * - Provides real-time preview of all font settings
 *
 * VARIABLE FONTS:
 * - Automatically detects and enables controls for variable font axes
 * - Maps standard axes to CSS properties (wght → font-weight, wdth → font-stretch)
 * - Preserves axis settings between edits
 * - Falls back to font-variation-settings for maximum compatibility
 * 
 * STYLING:
 * - Main container: .font-input
 * - Preview button: .font-preview-container, .font-preview, .font-details
 * - Size variants: .font-preview-container.large
 * - Panel content: .font-panel-content
 * - Preview area: .font-preview-area, .preview-text
 * - Controls: .font-controls, .control-group, .slider-container
 * - Font list: .font-list-container, .font-list, .font-item
 * - Selected font: .font-item.selected
 * 
 * DEBUGGING:
 * - Logs font loading status and errors
 * - Tracks variable axis changes and selections
 * - Passes debug flag to InputDetailComponent
 * - Provides detailed console output during font selection
 * 
 * DEPENDENCIES:
 * - Requires InputDetailComponent for the configuration panel
 * - Uses WebFont loader (loaded dynamically if not present)
 * - Requires FONTS constant from '../../constants/fonts.js'
 * 
 * EXAMPLES:
 * 
 * Basic heading font:
 * ```vue
 * <FontInput
 *   v-model="headingFont"
 *   label="Heading Font"
 *   size="large"
 * />
 * ```
 * 
 * Body text font with tearoff panel:
 * ```vue
 * <FontInput
 *   v-model="bodyFont"
 *   label="Body Text"
 *   default-display-mode="tearoff"
 * />
 * ```
 * 
 * Font with initial configuration:
 * ```vue
 * <FontInput
 *   v-model="customFont"
 *   label="Custom Font"
 *   size="large"
 * />
 * 
 * // Initial value
 * customFont = {
 *   family: "Playfair Display",
 *   category: "serif",
 *   size: 24,
 *   weight: 700,
 *   effect: "small-caps",
 *   axes: {}
 * }
 * ```
 */


import { reactive, ref, computed, watch, defineProps, defineEmits, getCurrentInstance, nextTick } from 'vue';
import { FONTS } from '../../constants/fonts.js';
import InputDetailComponent from './InputDetailComponent.vue';

const instance = getCurrentInstance();

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

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      family: '',
      category: '',
      size: 16,
      weight: 400,
      effect: 'none',
      axes: {}
    })
  },
  label: { type: String, default: '' },
  size: { type: String, default: 'regular' },
  defaultDisplayMode: { type: String, default: 'popup' },
  debug: { type: Boolean, default: false }
});
const emit = defineEmits(['update:modelValue']);

// Add initialization: if modelValue is null or undefined, emit default value
if (props.modelValue === null || props.modelValue === undefined) {
  emit('update:modelValue', {
    family: '',
    category: '',
    size: 16,
    weight: 400,
    effect: 'none',
    axes: {}
  });
}

// NEW: Define safeModelValue to use defaults if modelValue is null
const safeModelValue = computed(() => {
  const defaults = { family: '', category: '', size: 16, weight: 400, effect: 'none', axes: {} };
  return props.modelValue == null ? defaults : Object.assign({}, defaults, props.modelValue);
});

const fontConfig = computed(() => {
  const defaults = { family: 'Roboto', category: 'sans-serif', size: 16, weight: 400, effect: 'none', axes: {} };
  return {
    family: safeModelValue.value.family || defaults.family,
    category: safeModelValue.value.category || defaults.category,
    size: safeModelValue.value.size || defaults.size,
    weight: safeModelValue.value.weight || defaults.weight,
    effect: safeModelValue.value.effect || defaults.effect,
    axes: safeModelValue.value.axes || {}
  };
});

const searchTerm = ref("");
const fonts = ref([]);
const allFonts = ref([]);
const panelOpen = ref(false);
const tempConfig = ref(null);
const originalConfig = ref({
  family: 'Roboto',
  category: 'sans-serif',
  size: 16,
  weight: 400,
  effect: 'none',
  axes: {}
});

const selectedFontInfo = computed(() => {
  if (!tempConfig.value) return null;
  return FONTS[tempConfig.value.family] || null;
});

const availableWeights = computed(() => {
  if (!selectedFontInfo.value) return ["400"];
  return selectedFontInfo.value.weights || ["400"];
});

const initFromModelValue = () => {
  try {
    if (!tempConfig.value) {
      console.warn('tempConfig is null in initFromModelValue');
      return;
    }
    tempConfig.value.family = fontConfig.value.family || 'Roboto';
    tempConfig.value.category = fontConfig.value.category || 'sans-serif';
    tempConfig.value.size = fontConfig.value.size || 16;
    tempConfig.value.weight = fontConfig.value.weight || 400;
    tempConfig.value.effect = fontConfig.value.effect || 'none';
    tempConfig.value.axes = {};
    if (fontConfig.value.axes) {
      Object.entries(fontConfig.value.axes).forEach(([key, value]) => {
        tempConfig.value.axes[key] = value;
      });
    }
    originalConfig.value = {
      family: fontConfig.value.family || 'Roboto',
      category: fontConfig.value.category || 'sans-serif',
      size: fontConfig.value.size || 16,
      weight: fontConfig.value.weight || 400,
      effect: fontConfig.value.effect || 'none',
      axes: {}
    };
    if (fontConfig.value.axes) {
      Object.entries(fontConfig.value.axes).forEach(([key, value]) => {
        originalConfig.value.axes[key] = value;
      });
    }
    loadFont(fontConfig.value.family);
  } catch (error) {
    console.error('Error in initFromModelValue:', error);
  }
};

// Update reactive font properties to use safeModelValue
const fontFamily = ref(safeModelValue.value.family || 'Arial, sans-serif');
const fontSize = ref(safeModelValue.value.size || '14px');
const fontWeight = ref(safeModelValue.value.weight || '400');
const lineHeight = ref(safeModelValue.value.lineHeight || '1.5');
const letterSpacing = ref(safeModelValue.value.letterSpacing || 'normal');
const fontStyle = ref(safeModelValue.value.fontStyle || 'normal');

// Computed output that gathers font settings
const fontOutput = computed(() => ({
  fontFamily: fontFamily.value,
  fontSize: fontSize.value,
  fontWeight: fontWeight.value,
  lineHeight: lineHeight.value,
  letterSpacing: letterSpacing.value,
  fontStyle: fontStyle.value
}));

// Watch for changes and emit update
watch(fontOutput, (newVal) => {
  emit('update:modelValue', newVal);
}, { deep: true });

// Display mode and position
const displayMode = ref(props.defaultDisplayMode);
const panelPosition = ref({ top: '0px', left: '0px' });
const panelSize = ref({ width: '450px', height: '600px' });

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

// Additional axes for variable fonts (excluding weight)
const additionalAxes = computed(() => {
  if (!selectedFontInfo.value || !selectedFontInfo.value.isVariable || !selectedFontInfo.value.axes) {
    return [];
  }
  
  return selectedFontInfo.value.axes.filter(axis => axis.tag !== 'wght');
});

// Display name for the font
const displayFontName = computed(() => {
  return fontConfig.value.family;
});

// Style for the preview button
const previewStyle = computed(() => {
  return {
    fontFamily: `'${fontConfig.value.family}', ${fontConfig.value.category}`,
    fontWeight: fontConfig.value.weight,
    fontVariationSettings: getVariationSettingsFromConfig(fontConfig.value)
  };
});

// Open the font selection panel
const openPanel = () => {
  if (!tempConfig.value) {
    console.error('tempConfig is null in openPanel');
    return;
  }
  
  initFromModelValue();
  searchTerm.value = '';
  
  // Show only top fonts initially instead of all fonts
  fonts.value = getTopFonts();
  
  // Load fonts for the list
  preloadListFonts();
  
  panelOpen.value = true;
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
  // If a font in popularFamilies doesn't exist in allFonts, it will be skipped
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
const preloadListFonts = () => {
  // Preload first 20 fonts for better user experience
  const fontsToPreload = fonts.value.slice(0, 20);
  
  for (const font of fontsToPreload) {
    loadFont(font.family);
  }
};

// Load a specific font with appropriate weights and variations
const loadFont = async (fontFamily) => {
  if (!fontFamily) return;
  
  const fontInfo = FONTS[fontFamily];
  if (!fontInfo) return;
  
  try {
    let fontURL = fontFamily.replace(/ /g, '+');
    
    if (fontInfo.isVariable && fontInfo.axes) {
      const axisParams = fontInfo.axes.map(axis => `${axis.tag},${axis.start}..${axis.end}`).join(';');
      if (axisParams) {
        fontURL += `:${axisParams}`;
      }
    } else if (fontInfo.weights && fontInfo.weights.length) {
      fontURL += `:${fontInfo.weights.join(',')}`;
    }
    
    console.log('Loading font:', fontURL);
    
    if (window.WebFont) {
      await window.WebFont.load({
        google: { families: [fontURL] },
        active: () => {
          console.log('Font loaded successfully:', fontFamily);
          instance.proxy.$forceUpdate();
        },
        inactive: () => {
          console.warn('Failed to load font:', fontFamily);
        }
      });
    } else {
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
    
    // IMPORTANT: Use a completely different approach to clear axes
    tempConfig.value.axes = {};  // This works because tempConfig itself is reactive
    
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
          // Set other axes (works in Vue 3)
          console.log(`Setting axis ${axis.tag} to ${defaultValue}`);
          tempConfig.value.axes[axis.tag] = defaultValue;
          
          // Force Vue to recognize the change by making a computed property access
          nextTick(() => {
            console.log(`Axis ${axis.tag} set to:`, tempConfig.value.axes[axis.tag]);
          });
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
    
    // Force refresh of computed properties
    instance.proxy.$forceUpdate();
  } catch (error) {
    console.error('Error in selectFont:', error);
  }
};

// Find closest available weight
const findClosestWeight = (weights, targetWeight) => {
  return weights.reduce((prev, curr) => 
    Math.abs(curr - targetWeight) < Math.abs(prev - targetWeight) ? curr : prev
  );
};

// Get weight step for non-variable fonts
const getWeightStep = () => {
  // If there are very few weights, use a larger step to snap to available weights
  const weights = availableWeights.value.map(w => parseInt(w));
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
  
  try {
    // Update from originalConfig, property by property
    tempConfig.value.family = originalConfig.value.family;
    tempConfig.value.category = originalConfig.value.category;
    tempConfig.value.size = originalConfig.value.size;
    tempConfig.value.weight = originalConfig.value.weight;
    tempConfig.value.effect = originalConfig.value.effect;
    
    // Reset axes by creating a new empty object
    tempConfig.value.axes = {};
    
    // Copy axes from originalConfig
    if (originalConfig.value.axes) {
      Object.entries(originalConfig.value.axes).forEach(([key, value]) => {
        tempConfig.value.axes[key] = value;
      });
    }
    
    panelOpen.value = false;
  } catch (error) {
    console.error('Error in cancelSelection:', error);
    panelOpen.value = false;
  }
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
    
    // Optical size (opsz) is handled automatically by linking it to font size
    // We don't need to set font-optical-sizing explicitly
  }
  
  console.log('Applied style:', style);
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
      console.log('Current axes values:', tempConfig.value.axes);
      
      for (let i = 0; i < axisEntries.length; i++) {
        const [tag, value] = axisEntries[i];
        if (tag !== 'wght') { // Skip wght as it's already included
          settings += `, "${tag}" ${value}`;
        }
      }
    }
    
    // Make sure we also add axes from the font definition if they're not in tempConfig
    if (selectedFontInfo.value.axes) {
      for (const axis of selectedFontInfo.value.axes) {
        if (axis.tag !== 'wght' && (!tempConfig.value.axes[axis.tag])) {
          const defaultValue = Math.round((axis.start + axis.end) / 2);
          settings += `, "${axis.tag}" ${defaultValue}`;
          
          // Add it to tempConfig.axes for future use
          tempConfig.value.axes[axis.tag] = defaultValue;
        }
      }
    }
    
    console.log('Font variation settings:', settings);
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
  
  let settings = `"wght" ${config.weight}`;
  
  // Add other axes
  if (config.axes) {
    for (const [tag, value] of Object.entries(config.axes)) {
      settings += `, "${tag}" ${value}`;
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

// Get a human-readable label for an axis
const getAxisLabel = (tag) => {
  const axisLabels = {
    'wght': 'Weight',
    'wdth': 'Width',
    'slnt': 'Slant',
    'ital': 'Italic',
    'opsz': 'Optical Size'
  };
  
  return axisLabels[tag] || tag.toUpperCase();
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
    if (instance.proxy.$refs.previewText) {
      const style = getPreviewStyle();
      instance.proxy.$refs.previewText.style = style;
    }
    instance.proxy.$forceUpdate();
  });
};

// Update size and synchronize optical size if available
const updateSizeAndOpticalSize = () => {
  // If this font has an optical size axis, update it to match the font size
  if (opticalSizeAxis.value) {
    const opsz = opticalSizeAxis.value;
    
    // Constrain font size to optical size axis range if needed
    let opticalSize = tempConfig.value.size;
    
    // Make sure the optical size is within the valid range for the font
    opticalSize = Math.max(opsz.start, Math.min(opticalSize, opsz.end));
    
    // Update the optical size axis value
    updateAxisValue('opsz', opticalSize);
  }
};

// Get the optical size axis if available
const opticalSizeAxis = computed(() => {
  if (!selectedFontInfo.value || !selectedFontInfo.value.isVariable || !selectedFontInfo.value.axes) {
    return null;
  }
  
  return selectedFontInfo.value.axes.find(axis => axis.tag === 'opsz');
});

// Display mode management
const updateDisplayMode = (newMode) => {
  displayMode.value = newMode;
};

const updatePanelPosition = (newPosition) => {
  panelPosition.value = newPosition;
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