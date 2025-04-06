<template>
    <div class="background-editor-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Color Theme Editor</h3>
          <button class="close-btn" @click="$emit('close')">×</button>
        </div>
        
        <div class="modal-body">
          <!-- Color Theme Preview Section -->
          <div class="color-theme-preview-pane">
            <!-- Light Mode Swatches -->
            <div class="color-theme-section">
              <h4>Light Mode</h4>
              <div class="color-theme-swatches">
                <div 
                  v-for="(color, index) in colorTheme.light" 
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
                </div>
              </div>
            </div>
            
            <!-- Dark Mode Swatches -->
            <div class="color-theme-section">
              <h4>Dark Mode</h4>
              <div class="color-theme-swatches">
                <div 
                  v-for="(color, index) in colorTheme.dark" 
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
        
        <div class="modal-footer">
          <button class="btn cancel" @click="$emit('close')">Cancel</button>
          <button class="btn save" @click="$emit('save', colorTheme)">Save Changes</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>

import ThemeUtils from '../../services/ThemeUtils';
import { COLOR_THEMES } from '../../constants';

export default {
  name: 'ColorThemeEditor',
  props: {
    theme: { type: Object, required: true },
    colorMode: { type: String, default: 'light' }
  },
  emits: ['save', 'close'],
  data() {
    return {
      colorTheme: this.initColorTheme(),
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
  methods: {
    initColorTheme() {
      // Initialize from theme.colorTheme or use default
      if (this.theme.colorTheme && this.theme.colorTheme.light && this.theme.colorTheme.dark) {
        return JSON.parse(JSON.stringify(this.theme.colorTheme));
      }
      
      // Default color theme if none exists
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
    
    isDarkColor(hexColor) {
      // Helper to determine if text should be white or black
      const hex = hexColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness < 128;
    },
    
    // New direct color update method
    updateColor(mode, index, newColor) {
      this.colorTheme[mode][index] = newColor;
    },
    
    lightenAll(percent) {
      const mode = this.colorMode;
      this.colorTheme[mode] = this.colorTheme[mode].map(color => 
        ThemeUtils.lightenColor(color, percent)
      );
    },
    
    darkenAll(percent) {
      const mode = this.colorMode;
      this.colorTheme[mode] = this.colorTheme[mode].map(color => 
        ThemeUtils.darkenColor(color, percent)
      );
    },
    
    generateDarkFromLight() {
      // Generate dark mode colors based on light mode while preserving hues
      this.colorTheme.dark = this.colorTheme.light.map((color, index) => {
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
    
    adjustSaturation(hexColor, percent) {
      // Convert hex to HSL, adjust saturation, convert back
      const hex = hexColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      
      if (max === min) {
        h = s = 0; // achromatic
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      
      // Adjust saturation
      s = Math.min(1, s * (percent / 100));
      
      // Convert back to RGB
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs((h * 6) % 2 - 1));
      const m = l - c/2;
      let r1, g1, b1;
      
      if (h < 1/6) {
        [r1, g1, b1] = [c, x, 0];
      } else if (h < 2/6) {
        [r1, g1, b1] = [x, c, 0];
      } else if (h < 3/6) {
        [r1, g1, b1] = [0, c, x];
      } else if (h < 4/6) {
        [r1, g1, b1] = [0, x, c];
      } else if (h < 5/6) {
        [r1, g1, b1] = [x, 0, c];
      } else {
        [r1, g1, b1] = [c, 0, x];
      }
      
      // Convert to hex
      const toHex = (x) => {
        const hex = Math.round((x + m) * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      
      return `#${toHex(r1)}${toHex(g1)}${toHex(b1)}`;
    },
    
    generateHarmony() {
      this.showHarmonyPicker = true;
      this.harmonyBaseColor = this.colorTheme[this.colorMode][0];
      this.updateHarmonyPreview();
    },
    
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
          {let complementHue = (baseHue + 180) % 360;
          harmonicColors = [
            this.hslToHex(baseHue, baseSaturation * 0.7, 0.95),  // Background 1 
            this.hslToHex(baseHue, baseSaturation * 0.5, 0.9),   // Background 2
            this.hslToHex(complementHue, baseSaturation * 0.5, 0.85),  // Highlight 1
            this.hslToHex(complementHue, baseSaturation * 0.3, 0.9),   // Highlight 2
            this.hslToHex(baseHue, baseSaturation * 0.3, 0.8),   // Border 1
            this.hslToHex(baseHue, baseSaturation * 0.2, 0.85)   // Border 2
          ];}

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
          ];}
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
          ];}
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
          {const complement = (baseHue + 180) % 360;
          const splitComplement1 = (complement - 30 + 360) % 360;
          const splitComplement2 = (complement + 30) % 360;
          harmonicColors = [
            this.hslToHex(baseHue, baseSaturation * 0.4, 0.95),             // Background 1
            this.hslToHex(baseHue, baseSaturation * 0.3, 0.9),              // Background 2
            this.hslToHex(splitComplement1, baseSaturation * 0.5, 0.85),    // Highlight 1
            this.hslToHex(splitComplement2, baseSaturation * 0.5, 0.85),    // Highlight 2
            this.hslToHex(baseHue, baseSaturation * 0.2, 0.8),              // Border 1
            this.hslToHex(baseHue, baseSaturation * 0.1, 0.85)              // Border 2
          ];}
          break;
          
        case 'pastel':
          // Pastel - soft, high-lightness, low-saturation colors
          {const pastelSaturation = Math.min(baseSaturation * 0.5, 0.4);
          const pastelLightness = Math.max(baseLightness, 0.85);
          
          harmonicColors = [
            this.hslToHex(baseHue, pastelSaturation * 0.8, pastelLightness),               // Background 1
            this.hslToHex(baseHue, pastelSaturation * 0.5, pastelLightness + 0.05),        // Background 2
            this.hslToHex((baseHue + 60) % 360, pastelSaturation, pastelLightness),        // Highlight 1
            this.hslToHex((baseHue + 180) % 360, pastelSaturation, pastelLightness),       // Highlight 2
            this.hslToHex(baseHue, pastelSaturation * 0.3, pastelLightness - 0.05),        // Border 1
            this.hslToHex(baseHue, pastelSaturation * 0.2, pastelLightness)                // Border 2
          ];}
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
    },
    
    applyHarmony() {
      // Apply harmony colors to the current theme
      const harmonyColors = [...this.harmonyPreview];
      const mode = this.colorMode;
      
      // Apply all colors from the harmony preview to the theme
      for (let i = 0; i < Math.min(9, harmonyColors.length); i++) {
        this.colorTheme[mode][i] = harmonyColors[i];
      }
      
      this.showHarmonyPicker = false;
    },
    
    cancelHarmony() {
      this.showHarmonyPicker = false;
    },
    
    selectPreset(theme) {
      // Apply the selected preset theme
      this.colorTheme = {
        light: [...theme.light],
        dark: [...theme.dark]
      };
    }
  }
};

  </script>
  
  <style scoped>
  /* Modal container */
  .background-editor-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }
  
  /* Modal content */
  .modal-content {
    background-color: #fff;
    border-radius: 8px;
    width: 90%;
    max-width: 800px;
    margin: 20px auto;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 40px);
  }
  
  /* Modal header */
  .modal-header {
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    border-radius: 8px 8px 0 0;
  }
  
  .modal-header h3 {
    margin: 0;
    font-size: 1.3rem;
    color: #333;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    line-height: 1;
  }
  
  .close-btn:hover {
    color: #333;
  }
  
  /* Modal body - the main container */
  .modal-body {
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }
  
  /* No longer needed - replaced with color-theme-section */
  
  /* Color swatches grid */
  .color-theme-swatches {
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    gap: 15px;
    margin-bottom: 20px;
  }
  
  .color-swatch {
    aspect-ratio: 1/1;  /* Make swatches square */
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
  
  .color-swatch::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.1);
    font-size: 10px;
    text-align: center;
    opacity: 0;
    transition: opacity 0.2s;
  }
  
  .color-swatch:hover::after {
    opacity: 1;
  }
  
.color-input {
    /* Style for the color input */
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

  /* Simple color picker instead of popup */
  .color-input-row {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-top: 15px;
    margin-bottom: 20px;
    padding: 10px;
    background-color: #f5f5f5;
    border-radius: 6px;
  }
  
  .color-input-row input[type="color"] {
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .color-input-row input[type="text"] {
    flex: 1;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
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
  
  /* Preset themes section - with scrollable container */
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
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 15px;
    max-height: 250px; /* Make container scrollable */
    overflow-y: auto;
    padding-right: 10px; /* Add space for scrollbar */
    margin-right: -10px; /* Compensate for the scrollbar padding */
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
  
  .color-theme-preset .color-theme-preview-pane {
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
  .harmony-base-color {
    /* Style for the harmony base color input */
    width: 60px;
    height: 60px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    padding: 0; /* Remove padding for better alignment */
    margin-right: 10px; /* Space between the input and the preview */
    display: inline-block;
    vertical-align: middle;
  }

  .color-swatch-container {
    width: 100%; 
    height: 100%; 
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
  
  .btn.save {
    background-color: #4c84ff;
    color: white;
  }
  
  .btn.save:hover {
    background-color: #3b73e8;
  }
  
  /* Modal footer */
  .modal-footer {
    padding: 15px 20px;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    background: #fff;
    border-radius: 0 0 8px 8px;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .color-theme-swatches {
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
    }
    
    .tool-buttons {
      grid-template-columns: 1fr;
    }
    
    .harmony-controls {
      grid-template-columns: 1fr;
    }
    
    .color-themes-grid {
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    }
  }
</style>
