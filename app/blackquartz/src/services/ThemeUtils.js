// Theme utility functions
const ThemeUtils = {



  // Add new method to get current color based on value
  getCurrentColor(value, mode = 'light') {
    // If value is null or undefined, return a default color
    if (value == null) {
      return mode === 'light' ? '#000000' : '#FFFFFF';
    }

    // If value is a number (theme index)
    if (typeof value === 'number') {
      // Get the global theme color at this index
      // This needs to reference the theme object
      return this.getThemeColorByIndex(value, mode);
    }

    // If value is a dual mode color object
    if (typeof value === 'object' && value.light && value.dark) {
      return value[mode];
    }

    // If value is a hex string, return it directly
    return value;
  },

  // Method to get theme color by index (1-9)
  getThemeColorByIndex(index, mode = 'light') {
    // This would typically be implemented to access the global theme
    // For now, we'll return a fallback color
    if (window.globalTheme && window.globalTheme.colorTheme) {
      const themeColors = window.globalTheme.colorTheme[mode];
      if (themeColors && index >= 1 && index <= themeColors.length) {
        return themeColors[index - 1];
      }
    }
    
    // Fallback to default colors if theme or index doesn't exist
    return mode === 'light' ? '#000000' : '#FFFFFF';
  },

  // Existing lighten/darken/invert color methods...
  invertColor(hex) {
    if (!hex) return '#FFFFFF';
    
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Convert to RGB
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    
    // Determine if color is light or dark
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // For very light colors, return black; for dark colors, return white
    if (brightness > 128) {
      return '#333333'; // Dark gray instead of pure black for light colors
    } else {
      return '#F5F5F5'; // Light gray instead of pure white for dark colors
    }
  },

    // Color utility functions
    hexToRgb(hex) {
      // Remove # if present
      hex = hex.replace('#', '');
  
      // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
  
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
  
      return isNaN(r) || isNaN(g) || isNaN(b) ? '0,0,0' : `${r},${g},${b}`;
    },
  
    darkenColor(hex, percent) {
      // Strip the leading # if it exists
      hex = hex.replace(/^\s*#|\s*$/g, '');
  
      // Convert 3 char to 6 char
      if (hex.length == 3) {
        hex = hex.replace(/(.)/g, '$1$1');
      }
  
      // Convert hex to rgb
      var rgb = parseInt(hex, 16);
      var r = (rgb >> 16) & 0xff;
      var g = (rgb >> 8) & 0xff;
      var b = (rgb >> 0) & 0xff;
  
      // Darken
      r = Math.max(0, Math.floor(r * (100 - percent) / 100));
      g = Math.max(0, Math.floor(g * (100 - percent) / 100));
      b = Math.max(0, Math.floor(b * (100 - percent) / 100));
  
      // Convert back to hex
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },
  
    lightenColor(hex, percent) {
      // Strip the leading # if it exists
      hex = hex.replace(/^\s*#|\s*$/g, '');
  
      // Convert 3 char to 6 char
      if (hex.length == 3) {
        hex = hex.replace(/(.)/g, '$1$1');
      }
  
      // Convert hex to rgb
      var rgb = parseInt(hex, 16);
      var r = (rgb >> 16) & 0xff;
      var g = (rgb >> 8) & 0xff;
      var b = (rgb >> 0) & 0xff;
  
      // Lighten
      r = Math.min(255, Math.floor(r * (100 + percent) / 100));
      g = Math.min(255, Math.floor(g * (100 + percent) / 100));
      b = Math.min(255, Math.floor(b * (100 + percent) / 100));
  
      // Convert back to hex
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },
  
    // Makes a color dual-mode compatible
    makeColorDual(color) {
      // If it's already a dual color object, return it
      if (color && typeof color === 'object' && 'light' in color && 'dark' in color) {
        return color;
      }
  
      // If it's a string (hex color), create a dual color object
      if (typeof color === 'string') {
        return {
          light: color,
          dark: this.invertColor(color)
        };
      }
  
      // Default fallback
      return {
        light: '#000000',
        dark: '#ffffff'
      };
    },
  
    // Deep clone an object
    deepClone(obj) {
      return JSON.parse(JSON.stringify(obj));
    },
  
    // Deep merge objects
    deepMerge(target, source) {
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (!target[key]) target[key] = {};
          this.deepMerge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
      return target;
    },
  
    // Create a debounce function
    debounce(func, wait) {
      let timeout;
      return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          func.apply(context, args);
        }, wait);
      };
    }
  };
  
  export default ThemeUtils;