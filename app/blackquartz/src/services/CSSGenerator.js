import ThemeUtils from './ThemeUtils';

// CSS Generator for theme output
const CSSGenerator = {
  // Generate complete CSS for the theme
  generateCSS(theme, mode = 'light') {
    // Store in a global so ThemeUtils can access
    // Kind of a dumb approach here
    window.globalTheme = theme;

    return [
      this.generateBackgroundCSS(theme, mode),
      this.generatePageCSS(theme, mode),
      this.generateTypographyCSS(theme, mode),
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

  // Generate typography CSS
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

    let css = '/* Typography */\n';

    css += `body {\n  font-family: ${bodyFont};\n  color: ${textColor};\n  font-size: ${textSize}px;\n  line-height: ${lineHeight};\n}\n\n`;

    // Common styles for headings
    css += `h1, h2, h3, h4, h5, h6 {\n  font-family: ${headingFont};\n}\n\n`;

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

    // Additional typography CSS would go here
    
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
