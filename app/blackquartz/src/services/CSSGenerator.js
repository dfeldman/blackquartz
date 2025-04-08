import ThemeUtils from './ThemeUtils';

// CSS Generator for theme output
const CSSGenerator = {
  // Generate complete CSS for the theme
  generateCSS(theme, mode = 'light') {
    // Store in a global so ThemeUtils can access
    // Kind of a dumb approach here
    window.globalTheme = theme;

    return [
      // Typography must be first because it uses @import. Otherwise order doesn't matter.
      this.generateTypographyCSS(theme, mode),
      this.generateBackgroundCSS(theme, mode),
      this.generatePageCSS(theme, mode),
      this.generateHeroCSS(theme, mode),
      this.generateImageCSS(theme, mode),
      this.generateSectionCSS(theme, mode),
      this.generateBlockquoteCSS(theme, mode),
      this.generateTableCSS(theme, mode),
      this.generateListCSS(theme, mode),
      this.generateImageLinkCSS(theme, mode),
      this.generateAdvancedCSS(theme, mode),
    ].join('');
  },

  // Generate background CSS
  generateBackgroundCSS(theme, mode) {
    let css = '/* Body Background */\n';
    css += 'body {\n';
    css += this.getBackgroundTypeCSS(theme.backgrounds.body, 'body', mode);
    css += '  margin: 0;\n  padding: 0;\n  min-height: 100vh;\n}\n\n';
    return css;
  },

  // Generate CSS for a specific background type
  getBackgroundTypeCSS(bgSettings, target, mode) {
    if (!bgSettings) return '';
    
    const { type } = bgSettings;
    let css = '';

    if (type === 'color') {
      const color = ThemeUtils.getCurrentColor(bgSettings.color, mode);
      css += `  background-color: ${color};\n`;
    } else if (type === 'gradient') {
      // Handle gradient background
      const { gradient } = bgSettings;
      const stops = gradient.stops.map(stop => {
        // Convert stop colors to dual mode if needed
        const stopColor = ThemeUtils.getCurrentColor(stop.color, mode);
        return `${stopColor} ${stop.position}%`;
      }).join(', ');

      if (gradient.type === 'linear') {
        css += `  background: linear-gradient(${gradient.angle}deg, ${stops});\n`;
      } else if (gradient.type === 'radial') {
        css += `  background: radial-gradient(circle, ${stops});\n`;
      } else if (gradient.type === 'conic') {
        css += `  background: conic-gradient(from 0deg, ${stops});\n`;
      }
    }
    // Additional background type handling would go here
    
    return css;
  },

  // Generate page container CSS
  generatePageCSS(theme, mode) {
    const { enabled, shadowSize, borderSize, paddingX, paddingY, maxWidth, borderRadius } = theme.page;
    const borderColor = ThemeUtils.getCurrentColor(theme.page.borderColor, mode);

    let css = '/* Page Container */\n';
    css += '.page-container {\n';

    css += `  max-width: ${maxWidth}px;\n  margin: 40px auto;\n`;

    if (enabled) {
      css += this.getBackgroundTypeCSS(theme.backgrounds.page, 'page', mode);

      if (borderRadius > 0) {
        css += `  border-radius: ${borderRadius}px;\n`;
      }

      if (shadowSize > 0) {
        css += `  box-shadow: 0 0 ${shadowSize}px rgba(0, 0, 0, 0.2);\n`;
      }

      if (borderSize > 0) {
        css += `  border: ${borderSize}px solid ${borderColor};\n`;
      }
    }

    css += '  overflow: hidden;\n}\n\n';
    css += `/* Content Area */\n.content {\n  padding: ${paddingY}px ${paddingX}px;\n}\n\n`;
    return css;
  },

/**
 * Generates Google Fonts import statements for fonts
 * @param {Object} fonts - Object containing font configurations
 * @returns {String} CSS import statements
 */
 generateFontImports(fonts) {
    const imports = [];
    const loadedUrls = new Set(); // Track URLs to avoid duplicates
    
    // Helper function to process a font
    function processFontConfig(fontConfig) {
      if (!fontConfig) return;
      
      // Handle string format (like "'Inter', sans-serif")
      if (typeof fontConfig === 'string') {
        const match = fontConfig.match(/'([^']+)'/);
        if (match) {
          const family = match[1];
          // For known variable fonts like Inter, use appropriate axis ranges
          if (family === 'Inter') {
            const url = `https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap`;
            if (!loadedUrls.has(url)) {
              imports.push(`@import url('${url}');`);
              loadedUrls.add(url);
            }
          } else {
            // Standard format for regular fonts
            const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;700&display=swap`;
            if (!loadedUrls.has(url)) {
              imports.push(`@import url('${url}');`);
              loadedUrls.add(url);
            }
          }
        }
        return;
      }
      
      const family = fontConfig.family;
      if (!family) return;
      
      const weight = fontConfig.weight || 400;
      
      // Determine if it's a variable font
      const isVariable = fontConfig.axes && Object.keys(fontConfig.axes).length > 0;
      
      // For well-known variable fonts, use their known axis ranges
      if (isVariable) {
        // We need to use specific formats for specific fonts
        if (family === 'Inter') {
          const url = `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&display=swap`;
          if (!loadedUrls.has(url)) {
            imports.push(`@import url('${url}');`);
            loadedUrls.add(url);
          }
        } else {
          // For other variable fonts, use the standard approach
          // Just request the specific weight we need rather than a range
          const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`;
          if (!loadedUrls.has(url)) {
            imports.push(`@import url('${url}');`);
            loadedUrls.add(url);
          }
        }
      } else {
        // Standard approach for non-variable fonts
        const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`;
        if (!loadedUrls.has(url)) {
          imports.push(`@import url('${url}');`);
          loadedUrls.add(url);
        }
      }
    }
    
    // Process each font
    if (fonts.bodyFont) processFontConfig(fonts.bodyFont);
    if (fonts.headingFont) processFontConfig(fonts.headingFont);
    
    return imports.join('\n');
  },
  /**
   * Generates CSS for a font configuration
   * @param {Object|String} fontConfig - Font configuration object or string
   * @param {Number} lineHeight - Line height value
   * @returns {String} Font CSS properties
   */
generateFontCSS(fontConfig, lineHeight = 1.5) {
    // If fontConfig is a string (like "'Inter', sans-serif")
    if (typeof fontConfig === 'string') {
      return `font-family: ${fontConfig};\n` +
             `font-size: 16px;\n` +
             `line-height: ${lineHeight};\n` +
             `font-weight: 400;\n`;
    }
    
    if (!fontConfig || !fontConfig.family) {
      return `font-family: sans-serif;\n` +
             `font-size: 16px;\n` +
             `line-height: ${lineHeight};\n`;
    }
    
    // Extract font properties
    const family = fontConfig.family;
    const category = fontConfig.category || 'sans-serif';
    const size = fontConfig.size || 16;
    const weight = fontConfig.weight || 400;
    const italic = fontConfig.italic || false;
    const axes = fontConfig.axes || {};
    
    let css = '';
    
    // Add font-family with fallback
    css += `font-family: '${family}', ${category};\n`;
    
    // Add font-size
    css += `font-size: ${size}px;\n`;
    
    // Add line-height
    css += `line-height: ${lineHeight};\n`;
    
    // Add font-weight
    css += `font-weight: ${weight};\n`;
    
    // Add font-style
    if (italic || (axes.ital && axes.ital > 0.5)) {
      css += `font-style: italic;\n`;
    } else if (axes.slnt) {
      css += `font-style: oblique ${axes.slnt}deg;\n`;
    } else {
      css += `font-style: normal;\n`;
    }
    
    // Handle variable font axes
    let hasVariationSettings = false;
    let variationSettings = '';
    
    // Add variable font CSS properties
    if (Object.keys(axes).length > 0) {
      hasVariationSettings = true;
      
      // Handle width (wdth)
      if (axes.wdth !== undefined) {
        css += `font-stretch: ${axes.wdth}%;\n`;
        variationSettings += variationSettings ? `, "wdth" ${axes.wdth}` : `"wdth" ${axes.wdth}`;
      }
      
      // Handle optical size (opsz)
      if (axes.opsz !== undefined) {
        css += `font-optical-sizing: auto;\n`;
        variationSettings += variationSettings ? `, "opsz" ${axes.opsz}` : `"opsz" ${axes.opsz}`;
      }
      
      // Add weight to variation settings
      variationSettings += variationSettings ? `, "wght" ${weight}` : `"wght" ${weight}`;
      
      // Add other axes
      Object.entries(axes).forEach(([tag, value]) => {
        if (!['wdth', 'opsz', 'ital', 'slnt', 'wght'].includes(tag)) {
          variationSettings += variationSettings ? `, "${tag}" ${value}` : `"${tag}" ${value}`;
        }
      });
    }
    
    // Only add font-variation-settings if we have a variable font
    if (hasVariationSettings) {
      css += `font-variation-settings: ${variationSettings};\n`;
    }
    
    // Handle special effects
    if (fontConfig.effect && fontConfig.effect !== 'none') {
      switch (fontConfig.effect) {
        case 'uppercase':
          css += `text-transform: uppercase;\n`;
          break;
        case 'small-caps':
          css += `font-variant-caps: small-caps;\n`;
          break;
        case 'underline':
          css += `text-decoration: underline;\n`;
          break;
        case 'strikethrough':
          css += `text-decoration: line-through;\n`;
          break;
        case 'shadow':
          css += `text-shadow: 1px 1px 2px rgba(0,0,0,0.3);\n`;
          break;
        case 'drop-shadow':
          css += `text-shadow: 2px 2px 4px rgba(0,0,0,0.5);\n`;
          break;
        case 'highlight':
          css += `background-color: rgba(255, 255, 0, 0.3);\n`;
          break;
      }
    }
    
    return css;
  },

  generateTypographyCSS(theme, mode) {
    const { bodyFont, headingFont, lineHeight, titleSize, titleStyle, titleAlign,
      titlePaddingX, titlePaddingY, titleSpaceBelow,
      headingSize, headingStyle, headingSpaceAbove, headingSpaceBelow,
      textSize, linkUnderline, linkHoverEffect } = theme.type;
  
    // Get colors for current mode     
    const titleColor = ThemeUtils.getCurrentColor(theme.type.titleColor, mode);
    const headingColor = ThemeUtils.getCurrentColor(theme.type.headingColor, mode);
    const textColor = ThemeUtils.getCurrentColor(theme.type.textColor, mode);
    const linkColor = ThemeUtils.getCurrentColor(theme.type.linkColor, mode);
    const linkHoverColor = ThemeUtils.getCurrentColor(theme.type.linkHoverColor, mode);
  
    // Start with font imports - these must be at the very top
    let css = '/* Font Imports */\n';
    css += this.generateFontImports({bodyFont, headingFont}) + '\n\n';
  
    // Add typography styles
    css += '/* Typography */\n';
    
    // Body styles
    css += `body {\n  ${this.generateFontCSS(bodyFont, lineHeight)}\n  color: ${textColor};\n}\n\n`;
  
    // Heading styles
    css += `h1, h2, h3, h4, h5, h6 {\n  ${this.generateFontCSS(headingFont, lineHeight * 1.2)}\n  color: ${headingColor};\n}\n\n`;
  
    // Title styles
    css += `/* Main Title */\n.post-title {\n  color: ${titleColor};\n  font-size: ${titleSize}px;\n  margin-bottom: ${titleSpaceBelow}px;\n  font-weight: bold;\n  padding: ${titlePaddingY}px ${titlePaddingX}px;\n  text-align: ${titleAlign};\n`;
  
    switch (titleStyle) {
      case 'underline':
        css += `  border-bottom: 2px solid ${titleColor};\n  padding-bottom: 8px;\n`;
        break;
      case 'highlight':
        css += `  background: linear-gradient(to bottom, transparent 50%, rgba(${ThemeUtils.hexToRgb(titleColor)}, 0.2) 50%);\n  display: inline-block;\n  padding: ${titlePaddingY}px ${titlePaddingX + 5}px;\n`;
        break;
      case 'bordered':
        css += `  border: 2px solid ${titleColor};\n  padding: ${titlePaddingY + 10}px ${titlePaddingX + 10}px;\n`;
        break;
      case 'shadow':
        css += `  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);\n`;
        break;
      case 'gradient':
        css += `  background: linear-gradient(135deg, ${titleColor}, ${ThemeUtils.lightenColor(titleColor, 20)});\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  background-clip: text;\n`;
        break;
    }
  
    css += '}\n\n';
  
    // Link styles
    css += `a {\n  color: ${linkColor};\n  ${linkUnderline ? 'text-decoration: underline;' : 'text-decoration: none;'}\n}\n\n`;
    
    css += `a:hover {\n  color: ${linkHoverColor};\n`;
    
    // Link hover effects
    if (linkHoverEffect) {
      switch (linkHoverEffect) {
        case 'underline':
          css += `  text-decoration: underline;\n`;
          break;
        case 'bold':
          css += `  font-weight: bold;\n`;
          break;
        case 'color-shift':
          css += `  color: ${linkHoverColor};\n`;
          break;
        case 'highlight':
          css += `  background-color: rgba(${ThemeUtils.hexToRgb(linkHoverColor)}, 0.1);\n`;
          break;
      }
    }
    
    css += '}\n\n';
    
    return css;
  },




  // Generate Hero CSS
  generateHeroCSS(theme, mode) {
    if (!theme.hero || !theme.hero.enabled) return '';

    const { paddingX, paddingY, borderRadius, titleEffect } = theme.hero;

    let css = '/* Hero Panel */\n';
    css += '.hero-panel {\n';
    css += this.getBackgroundTypeCSS(theme.backgrounds.hero, 'hero', mode);
    css += `  padding: ${paddingY}px ${paddingX}px;\n`;

    if (borderRadius > 0) {
      css += `  border-radius: ${borderRadius}px;\n`;
    }

    css += '  margin-bottom: 30px;\n';
    css += '}\n\n';

    // Add title text effect
    if (titleEffect !== 'none' && theme.hero.enabled) {
      css += '.hero-panel .post-title {\n';

      if (titleEffect === 'shadow') {
        css += '  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);\n';
      } else if (titleEffect === 'glow') {
        css += '  text-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.5);\n';
      } else if (titleEffect === 'outline') {
        css += '  -webkit-text-stroke: 1px rgba(0, 0, 0, 0.3);\n';
      } else if (titleEffect === 'contrast') {
        css += '  background-color: rgba(0, 0, 0, 0.6);\n';
        css += '  color: white;\n';
        css += '  padding: 10px 20px;\n';
        css += '  display: inline-block;\n';
      }

      css += '}\n\n';
    }

    return css;
  },

  // Other CSS generation methods
  generateImageCSS(theme, mode) { return ''; }, // Implement as needed
  generateSectionCSS(theme, mode) { return ''; }, // Implement as needed
  generateBlockquoteCSS(theme, mode) { return ''; }, // Implement as needed
  generateTableCSS(theme, mode) { return ''; }, // Implement as needed
  generateListCSS(theme, mode) { return ''; }, // Implement as needed
  generateImageLinkCSS(theme, mode) { return ''; }, // Implement as needed
  generateAdvancedCSS(theme, mode) { return ''; }, // Implement as needed
};

export default CSSGenerator;
