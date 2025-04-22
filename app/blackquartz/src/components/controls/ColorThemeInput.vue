<template>
    <div class="color-theme-input" ref="colorThemeInputContainer">
      <!-- Color Theme Preview Button -->
      <div 
        class="color-preview-container" 
        :class="{ 'large': size === 'large' }"
        @click="openPanel"
        ref="colorPreview"
      >
        <div class="color-swatches-preview">
          <!-- Show 4 sample colors from the active theme (light or dark) -->
          <div 
            v-for="(color, index) in previewColors" 
            :key="index"
            class="color-swatch-preview"
            :style="{ backgroundColor: color }"
          ></div>
        </div>
        <div class="theme-details">
          <div class="theme-name">{{ label || 'Color Theme' }}</div>
          <div class="theme-mode">{{ colorMode === 'light' ? 'Light Mode' : 'Dark Mode' }}</div>
        </div>
      </div>
      
      <!-- Color Theme Panel using InputDetailComponent -->
      <InputDetailComponent
        v-if="tempTheme"
        :visible="panelOpen"
        :title="label || 'Color Theme'"
        :display-mode="displayMode"
        :target-element="$refs.colorPreview"
        :position="panelPosition"
        :size="panelSize"
        @update:size="panelSize = $event"
        @close="cancelSelection"
        @apply="applySelection"
        @cancel="cancelSelection"
        @update:display-mode="updateDisplayMode"
        @update:position="updatePanelPosition"
      >
        <!-- Panel content (adapted from ColorThemeEditor) -->
        <div class="color-theme-panel-content">
          <!-- Color Theme Preview Section -->
          <div class="color-theme-preview-pane">
            <!-- Light Mode Swatches -->
            <div class="color-theme-section">
              <h4>Light Mode</h4>
              <div class="color-theme-swatches">
                <div 
                  v-for="(color, index) in tempTheme.light" 
                  :key="`light-${index}`" 
                  class="color-swatch-container"
                  :title="colorNames[index]"
                >
                  <div 
                    class="color-swatch" 
                    :style="{ backgroundColor: color }"
                  >
                    <input 
                      type="color" 
                      :value="color" 
                      @input="updateColor('light', index, $event.target.value)" 
                      class="color-input"
                    >
                  </div>
                  <div class="color-name">{{ colorNames[index] }}</div>
                </div>
              </div>
            </div>
            
            <!-- Dark Mode Swatches -->
            <div class="color-theme-section">
              <h4>Dark Mode</h4>
              <div class="color-theme-swatches">
                <div 
                  v-for="(color, index) in tempTheme.dark" 
                  :key="`dark-${index}`" 
                  class="color-swatch-container"
                  :title="colorNames[index]"
                >
                  <div 
                    class="color-swatch" 
                    :style="{ backgroundColor: color }"
                  >
                    <input 
                      type="color" 
                      :value="color" 
                      @input="updateColor('dark', index, $event.target.value)" 
                      class="color-input"
                    >
                  </div>
                  <div class="color-name">{{ colorNames[index] }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Theme Manipulation Tools Section -->
          <div class="theme-tools">
            <h4>Theme Adjustments</h4>
            <div class="tool-buttons">
              <button class="btn small" @click="lightenAll(10)">Lighten All</button>
              <button class="btn small" @click="darkenAll(10)">Darken All</button>
              <button class="btn small" @click="generateDarkFromLight">Generate Dark from Light</button>
              <button class="btn small" @click="generateHarmony">Generate Harmonious Colors</button>
            </div>
            
            <!-- Harmony popup (only for harmony generation) -->
            <div class="harmony-base" v-if="showHarmonyPicker">
              <h5>Select Base Color for Harmony</h5>
              <input type="color" v-model="harmonyBaseColor" @input="updateHarmonyPreview">
              <div class="harmony-preview">
                <div 
                  v-for="(color, index) in harmonyPreview" 
                  :key="`harmony-${index}`"
                  class="harmony-swatch"
                  :style="{ backgroundColor: color }"
                ></div>
              </div>
              <div class="harmony-controls">
                <select v-model="harmonyType" @change="updateHarmonyPreview">
                  <option value="analogous">Analogous</option>
                  <option value="complementary">Complementary</option>
                  <option value="triadic">Triadic</option>
                  <option value="tetradic">Tetradic</option>
                  <option value="monochromatic">Monochromatic</option>
                  <option value="split-complementary">Split Complementary</option>
                  <option value="pastel">Pastel</option>
                  <option value="earthy">Earth Tones</option>
                </select>
                <button class="btn small" @click="applyHarmony">Apply</button>
                <button class="btn small cancel" @click="cancelHarmony">Cancel</button>
              </div>
            </div>
          </div>
          
          <!-- Preset Themes Section -->
          <div class="preset-themes">
            <h4>Preset Themes</h4>
            <div class="color-themes-grid">
              <div 
                v-for="theme in presetThemes" 
                :key="theme.name" 
                class="color-theme-preset" 
                @click="selectPreset(theme)"
              >
                <div class="color-theme-preview">
                  <div 
                    v-for="color in theme.light.slice(0, 4)" 
                    :key="`light-${color}`" 
                    class="theme-color-sample"
                    :style="{ backgroundColor: color }"
                  ></div>
                </div>
                <div class="color-theme-name">{{ theme.name }}</div>
              </div>
            </div>
          </div>
        </div>
      </InputDetailComponent>
    </div>
  </template>
  
  <script>





/**
 * ColorThemeInput
 * ==============
 * A comprehensive color theme selection and configuration component for theme designers.
 * Enables selection, preview, and customization of complete color palettes with support
 * for both light and dark modes.
 * 
 * FEATURES:
 * - Visual color swatch preview with light/dark mode support
 * - Color picker for individual color customization
 * - Theme manipulation tools (lighten, darken)
 * - Color harmony generation with multiple options
 * - Preset theme selection
 * - Real-time color preview
 * - Dark mode generation from light mode
 * 
 * BASIC USAGE:
 * ```vue
 * <ColorThemeInput
 *   v-model="themeColors"
 *   label="Site Colors"
 *   color-mode="light"
 * />
 * ```
 * 
 * PROPS:
 * @prop {Object} modelValue - Color theme configuration object (required)
 * @prop {String} label - Label for the component
 * @prop {String} colorMode - Active color mode: 'light' or 'dark' (default: 'light')
 * @prop {String} size - UI size variant: 'regular' or 'large' (default: 'regular')
 * @prop {String} defaultDisplayMode - Initial display mode: 'popup', 'modal', 'tearoff', 'panel' (default: 'popup')
 * 
 * EVENTS:
 * @emits {update:modelValue} - When the color theme configuration changes
 * 
 * MODEL VALUE FORMAT:
 * The component expects and returns a configuration object with both light and dark color arrays:
 * {
 *   light: [
 *     '#000000', // Text color
 *     '#222222', // Heading color
 *     '#FFFFFF', // Page background color
 *     '#F5F5F5', // Body background color 1
 *     '#EFEFEF', // Body background color 2
 *     '#E0F0FF', // Highlight background color 1
 *     '#FFFDE0', // Highlight background color 2
 *     '#DDDDDD', // Large border color
 *     '#EEEEEE'  // Small border color
 *   ],
 *   dark: [
 *     // Same structure but with dark mode appropriate colors
 *   ]
 * }
 * 
 * COLOR HARMONY TYPES:
 * - analogous: Colors adjacent on the color wheel
 * - complementary: Opposite colors on the color wheel
 * - triadic: Three evenly spaced colors
 * - tetradic: Four evenly spaced colors
 * - monochromatic: Variations of a single color
 * - split-complementary: A color and two colors adjacent to its complement
 * - pastel: Soft, high-lightness, low-saturation colors
 * - earthy: Muted, natural earth tones
 * 
 * INTERNAL BEHAVIOR:
 * - Uses InputDetailComponent for the configuration panel
 * - Maintains temporary theme state during editing
 * - Preserves original theme for cancellation
 * - Provides color manipulation utilities (HSL conversion, lighten/darken)
 * - Implements color harmony algorithms for palette generation
 * - Responsive design with mobile-friendly layouts
 * - Real-time color preview updates
 * 
 * DEPENDENCIES:
 * - Requires InputDetailComponent for the configuration panel
 * - Uses ThemeUtils service for color manipulation
 * - Requires COLOR_THEMES constant for preset themes
 * STYLING:
 * - Main container: .color-theme-input
 * - Preview button: .color-preview-container, .color-swatches-preview
 * - Size variants: .color-preview-container.large
 * - Panel content: .color-theme-panel-content
 * - Color swatches: .color-theme-swatches, .color-swatch
 * - Theme tools: .theme-tools, .tool-buttons
 * - Harmony tools: .harmony-base, .harmony-preview, .harmony-controls
 * - Preset themes: .preset-themes, .color-themes-grid
 * - Media queries for responsive layouts at various breakpoints
 * 
 * DEBUGGING:
 * - Color harmony preview shows generated colors before application
 * - Color conversion utilities (HSL/hex) handle edge cases
 * - Responsive debugging with different screen size layouts
 * 
 * EXAMPLES:
 * 
 * Basic theme configuration:
 * ```vue
 * <ColorThemeInput
 *   v-model="siteTheme"
 *   label="Site Theme"
 * />
 * ```
 * 
 * Dark mode configuration:
 * ```vue
 * <ColorThemeInput
 *   v-model="siteTheme"
 *   label="Dark Mode"
 *   color-mode="dark"
 * />
 * ```
 * 
 * Custom size and display mode:
 * ```vue
 * <ColorThemeInput
 *   v-model="siteTheme"
 *   label="Brand Colors"
 *   size="large"
 *   default-display-mode="tearoff"
 * />
 * ```
 * 
 * Initial theme value:
 * ```vue
 * <script>
 * export default {
 *   data() {
 *     return {
 *       siteTheme: {
 *         light: [
 *           '#000000', // Text
 *           '#222222', // Heading
 *           '#FFFFFF', // Page background
 *           '#F5F5F5', // etc...
 *         ],
 *         dark: [
 *           '#FFFFFF', // Text
 *           '#F0F0F0', // Heading
 *           '#121212', // Page background
 *            etc...
 *         ]
 *       }
 *     };
 *   }
 * }
 * </sc   ript>
*/



  import { reactive } from 'vue';
  import ThemeUtils from '../../services/ThemeUtils';
  import { COLOR_THEMES } from '../../constants';
  import InputDetailComponent from './InputDetailComponent.vue';
  
  export default {
    name: 'ColorThemeInput',
    components: {
      InputDetailComponent
    },
    props: {
      modelValue: { type: Object, required: true },
      label: String,
      colorMode: { type: String, default: 'light' },
      size: { type: String, default: 'regular' }, // 'regular' or 'large'
      defaultDisplayMode: { type: String, default: 'popup' } // 'popup', 'modal', 'tearoff', 'panel'
    },
    emits: ['update:modelValue'],
    data() {
      return {
        panelOpen: false,
        displayMode: this.defaultDisplayMode,
        panelPosition: { top: '0px', left: '0px' },
        panelSize: { width: '800px', height: '700px' },
        
        // Temporary theme during editing
        tempTheme: null, // Will be initialized in mounted
        
        // Original theme before editing (for cancellation)
        originalTheme: null,
        
        colorNames: [
          'Text Color',
          'Heading Color',
          'Page Background',
          'Body Background 1',
          'Body Background 2',
          'Highlight Background 1',
          'Highlight Background 2',
          'Large Border',
          'Small Border'
        ],
        presetThemes: COLOR_THEMES,
        showHarmonyPicker: false,
        harmonyBaseColor: '#3366CC',
        harmonyType: 'analogous',
        harmonyPreview: []
      };
    },
    computed: {
      // The active color theme from modelValue
      colorTheme() {
        // Ensure we have light and dark modes
        if (this.modelValue && this.modelValue.light && this.modelValue.dark) {
          return this.modelValue;
        }
        
        // Default color theme
        return {
          light: [
            '#000000', // Text color
            '#222222', // Heading color
            '#FFFFFF', // Page background color
            '#F5F5F5', // Body background color 1
            '#EFEFEF', // Body background color 2
            '#E0F0FF', // Highlight background color 1
            '#FFFDE0', // Highlight background color 2
            '#DDDDDD', // Large border color
            '#EEEEEE'  // Small border color
          ],
          dark: [
            '#FFFFFF', // Text color
            '#F0F0F0', // Heading color
            '#121212', // Page background color
            '#1E1E1E', // Body background color 1
            '#2D2D2D', // Body background color 2
            '#103050', // Highlight background color 1
            '#504810', // Highlight background color 2
            '#444444', // Large border color
            '#333333'  // Small border color
          ]
        };
      },
      
      // Colors to show in the preview button (first 4 colors)
      previewColors() {
        const mode = this.colorMode;
        if (this.colorTheme && this.colorTheme[mode]) {
          return this.colorTheme[mode].slice(0, 4); // First 4 colors
        }
        return ['#000000', '#222222', '#FFFFFF', '#F5F5F5']; // Default
      }
    },
    watch: {
      modelValue: {
        handler() {
          if (this.tempTheme) {
            this.initFromModelValue();
          }
        },
        deep: true
      }
    },
    mounted() {
      // Initialize tempTheme with reactive properties
      this.initFromModelValue();
    },
    methods: {
      // Display mode management
      updateDisplayMode(newMode) {
        this.displayMode = newMode;
      },
      
      updatePanelPosition(newPosition) {
        this.panelPosition = newPosition;
      },
      
      // Initialize from model value
      initFromModelValue() {
        try {
          // Create a deep copy of the color theme
          const theme = JSON.parse(JSON.stringify(this.colorTheme));
          
          // Initialize tempTheme and originalTheme
          this.tempTheme = reactive(theme);
          this.originalTheme = JSON.parse(JSON.stringify(theme));
        } catch (error) {
          console.error('Error in initFromModelValue:', error);
        }
      },
      
      // Open the color selection panel
      openPanel() {
        this.initFromModelValue();
        this.showHarmonyPicker = false;
        this.panelOpen = true;
      },
      
      // Update a specific color
      updateColor(mode, index, newColor) {
        if (this.tempTheme) {
          this.tempTheme[mode][index] = newColor;
        }
      },
      
      // Lighten all colors in current mode
      lightenAll(percent) {
        const mode = this.colorMode;
        if (this.tempTheme) {
          this.tempTheme[mode] = this.tempTheme[mode].map(color => 
            ThemeUtils.lightenColor(color, percent)
          );
        }
      },
      
      // Darken all colors in current mode
      darkenAll(percent) {
        const mode = this.colorMode;
        if (this.tempTheme) {
          this.tempTheme[mode] = this.tempTheme[mode].map(color => 
            ThemeUtils.darkenColor(color, percent)
          );
        }
      },
      
      // Generate dark mode colors from light mode
      generateDarkFromLight() {
        if (!this.tempTheme) return;
        
        // Generate dark mode colors based on light mode while preserving hues
        this.tempTheme.dark = this.tempTheme.light.map((color, index) => {
          // For the first three colors (text, heading, background), we flip them
          if (index === 0 || index === 1) {
            // Text and heading colors become white
            return '#FFFFFF';
          } else if (index === 2) {
            // Page background becomes very dark
            return '#121212';
          } else {
            // For other colors, maintain hue but adjust lightness and saturation
            const hue = this.getHue(color);
            const saturation = this.getSaturation(color);
            const lightness = this.getLightness(color);
            
            // Calculate new lightness (invert it in a controlled way)
            // For light colors, make them darker; for dark colors, make them lighter
            const newLightness = lightness > 0.5 
              ? Math.max(0.15, lightness - 0.5) // For light colors, make darker
              : Math.min(0.4, lightness + 0.1); // For dark colors, make slightly lighter
            
            // Adjust saturation - darker themes often need more saturation to "pop"
            const newSaturation = Math.min(1, saturation * 1.2);
            
            return this.hslToHex(hue, newSaturation, newLightness);
          }
        });
      },
      
      // Generate harmony colors
      generateHarmony() {
        this.showHarmonyPicker = true;
        this.harmonyBaseColor = this.tempTheme[this.colorMode][0];
        this.updateHarmonyPreview();
      },
      
      // Update harmony preview based on selected type
      updateHarmonyPreview() {
        // Generate color harmony preview based on selected type
        const baseHue = this.getHue(this.harmonyBaseColor);
        const baseSaturation = this.getSaturation(this.harmonyBaseColor);
        const baseLightness = this.getLightness(this.harmonyBaseColor);
        
        // First 3 colors always black, black, white (for text, heading, background)
        const constantColors = ['#000000', '#000000', '#FFFFFF'];
        
        // Generate colors for the remaining 6 slots
        let harmonicColors = [];
        
        switch (this.harmonyType) {
          case 'analogous':
            // Analogous - colors that are adjacent on the color wheel
            harmonicColors = [
              this.hslToHex(baseHue, baseSaturation * 0.7, 0.95),  // Background 1 - Light version
              this.hslToHex(baseHue, baseSaturation * 0.5, 0.9),   // Background 2 - Lighter, less saturated
              this.hslToHex((baseHue + 30) % 360, baseSaturation * 0.8, 0.85),  // Highlight 1
              this.hslToHex((baseHue - 30 + 360) % 360, baseSaturation * 0.8, 0.85),  // Highlight 2
              this.hslToHex(baseHue, baseSaturation * 0.4, 0.75),  // Border 1
              this.hslToHex(baseHue, baseSaturation * 0.3, 0.85)   // Border 2
            ];
            break;
            
          case 'complementary':
            // Complementary - opposite colors on the color wheel
            {
              let complementHue = (baseHue + 180) % 360;
              harmonicColors = [
                this.hslToHex(baseHue, baseSaturation * 0.7, 0.95),  // Background 1 
                this.hslToHex(baseHue, baseSaturation * 0.5, 0.9),   // Background 2
                this.hslToHex(complementHue, baseSaturation * 0.5, 0.85),  // Highlight 1
                this.hslToHex(complementHue, baseSaturation * 0.3, 0.9),   // Highlight 2
                this.hslToHex(baseHue, baseSaturation * 0.3, 0.8),   // Border 1
                this.hslToHex(baseHue, baseSaturation * 0.2, 0.85)   // Border 2
              ];
            }
            break;
            
          case 'triadic':
            {
              // Triadic - three evenly spaced colors on the color wheel
              const triad1 = (baseHue + 120) % 360;
              const triad2 = (baseHue + 240) % 360;
              harmonicColors = [
                this.hslToHex(baseHue, baseSaturation * 0.5, 0.95),    // Background 1
                this.hslToHex(baseHue, baseSaturation * 0.3, 0.9),     // Background 2
                this.hslToHex(triad1, baseSaturation * 0.5, 0.85),     // Highlight 1
                this.hslToHex(triad2, baseSaturation * 0.5, 0.85),     // Highlight 2
                this.hslToHex(baseHue, baseSaturation * 0.3, 0.75),    // Border 1
                this.hslToHex(baseHue, baseSaturation * 0.2, 0.85)     // Border 2
              ];
            }
            break;
            
          case 'tetradic':
            {
              // Tetradic - four evenly spaced colors on the color wheel
              const tetra1 = (baseHue + 90) % 360;
              const tetra2 = (baseHue + 180) % 360;
              const tetra3 = (baseHue + 270) % 360;
              harmonicColors = [
                this.hslToHex(baseHue, baseSaturation * 0.5, 0.95),    // Background 1
                this.hslToHex(baseHue, baseSaturation * 0.3, 0.9),     // Background 2
                this.hslToHex(tetra1, baseSaturation * 0.5, 0.85),     // Highlight 1
                this.hslToHex(tetra2, baseSaturation * 0.4, 0.85),     // Highlight 2
                this.hslToHex(tetra3, baseSaturation * 0.3, 0.8),      // Border 1
                this.hslToHex(baseHue, baseSaturation * 0.2, 0.85)     // Border 2
              ];
            }
            break;
            
          case 'monochromatic':
            // Monochromatic - variations of a single color
            harmonicColors = [
              this.hslToHex(baseHue, baseSaturation * 0.4, 0.98),    // Background 1 (Lightest)
              this.hslToHex(baseHue, baseSaturation * 0.5, 0.95),    // Background 2 (Light)
              this.hslToHex(baseHue, baseSaturation * 0.6, 0.85),    // Highlight 1
              this.hslToHex(baseHue, baseSaturation * 0.7, 0.8),     // Highlight 2
              this.hslToHex(baseHue, baseSaturation * 0.3, 0.75),    // Border 1
              this.hslToHex(baseHue, baseSaturation * 0.2, 0.85)     // Border 2
            ];
            break;
            
          case 'split-complementary':
            // Split Complementary - a color and two colors adjacent to its complement
            {
              const complement = (baseHue + 180) % 360;
              const splitComplement1 = (complement - 30 + 360) % 360;
              const splitComplement2 = (complement + 30) % 360;
              harmonicColors = [
                this.hslToHex(baseHue, baseSaturation * 0.4, 0.95),             // Background 1
                this.hslToHex(baseHue, baseSaturation * 0.3, 0.9),              // Background 2
                this.hslToHex(splitComplement1, baseSaturation * 0.5, 0.85),    // Highlight 1
                this.hslToHex(splitComplement2, baseSaturation * 0.5, 0.85),    // Highlight 2
                this.hslToHex(baseHue, baseSaturation * 0.2, 0.8),              // Border 1
                this.hslToHex(baseHue, baseSaturation * 0.1, 0.85)              // Border 2
              ];
            }
            break;
            
          case 'pastel':
            // Pastel - soft, high-lightness, low-saturation colors
            {
              const pastelSaturation = Math.min(baseSaturation * 0.5, 0.4);
              const pastelLightness = Math.max(baseLightness, 0.85);
              
              harmonicColors = [
                this.hslToHex(baseHue, pastelSaturation * 0.8, pastelLightness),               // Background 1
                this.hslToHex(baseHue, pastelSaturation * 0.5, pastelLightness + 0.05),        // Background 2
                this.hslToHex((baseHue + 60) % 360, pastelSaturation, pastelLightness),        // Highlight 1
                this.hslToHex((baseHue + 180) % 360, pastelSaturation, pastelLightness),       // Highlight 2
                this.hslToHex(baseHue, pastelSaturation * 0.3, pastelLightness - 0.05),        // Border 1
                this.hslToHex(baseHue, pastelSaturation * 0.2, pastelLightness)                // Border 2
              ];
            }
            break;
            
          case 'earthy':
            // Earth tones - muted, natural colors with golden ratio harmony
            harmonicColors = [
              this.hslToHex(30, 0.3, 0.95),   // Light sand (Background 1)
              this.hslToHex(40, 0.25, 0.9),   // Beige (Background 2)
              this.hslToHex(20, 0.4, 0.8),    // Tan (Highlight 1)
              this.hslToHex(80, 0.3, 0.7),    // Olive (Highlight 2)
              this.hslToHex(10, 0.3, 0.75),   // Brown (Border 1)
              this.hslToHex(35, 0.2, 0.85)    // Light brown (Border 2)
            ];
            break;
        }
        
        // Combine the constant colors with the harmonic colors
        this.harmonyPreview = [...constantColors, ...harmonicColors];
      },
      
      // Apply harmony colors
      applyHarmony() {
        if (!this.tempTheme) return;
        
        // Apply harmony colors to the current theme
        const harmonyColors = [...this.harmonyPreview];
        const mode = this.colorMode;
        
        // Apply all colors from the harmony preview to the theme
        for (let i = 0; i < Math.min(9, harmonyColors.length); i++) {
          this.tempTheme[mode][i] = harmonyColors[i];
        }
        
        this.showHarmonyPicker = false;
      },
      
      // Cancel harmony generation
      cancelHarmony() {
        this.showHarmonyPicker = false;
      },
      
      // Select a preset theme
      selectPreset(theme) {
        if (!this.tempTheme) return;
        
        // Apply the selected preset theme
        this.tempTheme.light = [...theme.light];
        this.tempTheme.dark = [...theme.dark];
      },
      
      // Apply the selection and emit the updated value
      applySelection() {
        if (!this.tempTheme) return;
        
        // Emit the updated model value
        this.$emit('update:modelValue', JSON.parse(JSON.stringify(this.tempTheme)));
        this.panelOpen = false;
      },
      
      // Cancel and close the panel
      cancelSelection() {
        if (!this.tempTheme) {
          this.panelOpen = false;
          return;
        }
        
        // Reset to original values
        if (this.originalTheme) {
          this.tempTheme.light = [...this.originalTheme.light];
          this.tempTheme.dark = [...this.originalTheme.dark];
        }
        
        this.panelOpen = false;
      },
      
      // Color conversion and manipulation helper methods
      getHue(hexColor) {
        const hex = hexColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16) / 255;
        const g = parseInt(hex.substr(2, 2), 16) / 255;
        const b = parseInt(hex.substr(4, 2), 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h;
        
        if (max === min) {
          return 0; // achromatic
        }
        
        const d = max - min;
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        
        return Math.round(h * 60);
      },
      
      getSaturation(hexColor) {
        const hex = hexColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16) / 255;
        const g = parseInt(hex.substr(2, 2), 16) / 255;
        const b = parseInt(hex.substr(4, 2), 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const l = (max + min) / 2;
        
        if (max === min) {
          return 0; // achromatic
        }
        
        const d = max - min;
        return l > 0.5 ? d / (2 - max - min) : d / (max + min);
      },
      
      getLightness(hexColor) {
        const hex = hexColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16) / 255;
        const g = parseInt(hex.substr(2, 2), 16) / 255;
        const b = parseInt(hex.substr(4, 2), 16) / 255;
        
        return (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
      },
      
      hslToHex(h, s, l) {
        h = h / 360;
        let r, g, b;
        
        if (s === 0) {
          r = g = b = l; // achromatic
        } else {
          const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
          };
          
          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          const p = 2 * l - q;
          
          r = hue2rgb(p, q, h + 1/3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1/3);
        }
        
        const toHex = (x) => {
          const hex = Math.round(x * 255).toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        };
        
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
      }
    }
  };
  </script>
  
  <style scoped>
  .color-theme-input {
    position: relative;
    margin-bottom: 10px;
  }
  
  /* Color Preview Button */
  .color-preview-container {
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
  
  .color-preview-container:hover {
    border-color: #aaa;
  }
  
  /* Large size variant */
  .color-preview-container.large {
    padding: 12px 8px;
  }
  
  .color-swatches-preview {
    display: flex;
    margin-right: 12px;
  }
  
  .color-swatch-preview {
    width: 20px;
    height: 20px;
    border-radius: 3px;
    margin-right: 2px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .large .color-swatch-preview {
    width: 24px;
    height: 24px;
  }
  
  .theme-details {
    display: flex;
    flex-direction: column;
  }
  
  .theme-name {
    font-weight: 500;
    margin-bottom: 2px;
  }
  
  .theme-mode {
    font-size: 12px;
    color: #666;
  }
  
  /* Color Theme Panel Content */
  .color-theme-panel-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    height: 100%;
  }
  
  /* Color Theme Sections */
  .color-theme-section {
    margin-bottom: 20px;
  }
  
  .color-theme-section h4 {
    margin: 0 0 15px 0;
    font-size: 1.1rem;
    color: #444;
  }
  
  /* Color swatches grid */
  .color-theme-swatches {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    margin-bottom: 10px;
  }
  
  .color-swatch-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .color-name {
    font-size: 12px;
    color: #666;
    margin-top: 5px;
    text-align: center;
  }
  
  .color-swatch {
    width: 60px;
    height: 60px; 
    border-radius: 6px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    position: relative;
    overflow: hidden;
  }
  
  .color-swatch:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  .color-input {
    width: 60px;
    height: 60px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    opacity: 0; /* Hide the default input, show color swatch instead */
    position: absolute; /* Position it over the swatch */
    top: 0;
    left: 0;
  }
  
  /* Theme tools */
  .theme-tools {
    background: #f9f9f9;
    border-radius: 8px;
    border: 1px solid #eee;
    padding: 20px;
    margin-bottom: 20px;
  }
  
  .theme-tools h4 {
    margin: 0 0 15px 0;
    font-size: 1.1rem;
    color: #444;
  }
  
  .tool-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
    margin-bottom: 15px;
  }
  
  /* Harmony section */
  .harmony-base {
    background: #f5f5f5;
    padding: 20px;
    border-radius: 8px;
    margin-top: 20px;
    border: 1px solid #ddd;
  }
  
  .harmony-base h5 {
    margin: 0 0 15px 0;
    font-size: 1rem;
    color: #444;
  }
  
  .harmony-preview {
    display: flex;
    gap: 10px;
    margin: 15px 0;
    flex-wrap: wrap;
  }
  
  .harmony-swatch {
    width: 50px;
    height: 50px;
    border-radius: 6px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  .harmony-controls {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 10px;
    align-items: center;
    margin-top: 15px;
  }
  
  .harmony-controls select {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
  }
  
  /* Preset themes section */
  .preset-themes {
    padding: 20px;
    background: #f9f9f9;
    border-radius: 8px;
    border: 1px solid #eee;
  }
  
  .preset-themes h4 {
    margin: 0 0 15px 0;
    font-size: 1.1rem;
    color: #444;
  }
  
  .color-themes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 15px;
    max-height: 200px; /* Make container scrollable */
    overflow-y: auto;
    padding-right: 10px; /* Add space for scrollbar */
  }
  
  .color-theme-preset {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    background-color: white;
  }
  
  .color-theme-preset:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .color-theme-preset .color-theme-preview {
    display: flex;
    height: 40px;
    margin: 0;
  }
  
  .theme-color-sample {
    flex: 1;
    height: 100%;
  }
  
  .color-theme-name {
    padding: 8px;
    text-align: center;
    font-size: 12px;
    background-color: #f9f9f9;
    border-top: 1px solid #eee;
  }
  
  /* Button styling */
  .btn {
    padding: 8px 15px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s, transform 0.1s;
  }
  
  .btn:active {
    transform: translateY(1px);
  }
  
  .btn.small {
    padding: 6px 12px;
    font-size: 0.9em;
  }
  
  .btn.cancel {
    background-color: #f0f0f0;
    color: #333;
  }
  
  .btn.cancel:hover {
    background-color: #e0e0e0;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .color-theme-swatches {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .tool-buttons {
      grid-template-columns: 1fr 1fr;
    }
    
    .harmony-controls {
      grid-template-columns: 1fr;
    }
    
    .color-themes-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }
  }
  
  @media (min-width: 768px) and (max-width: 1024px) {
    .color-theme-swatches {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  @media (min-width: 1024px) {
    .color-theme-swatches {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  </style>
  