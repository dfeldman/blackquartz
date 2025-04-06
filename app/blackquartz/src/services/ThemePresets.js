// Theme presets and utilities
const ThemePresets = {
    // Default theme (starting point)
    defaultTheme() {
      return {
        // Responsive preview settings
        responsivePreview: {
          enabled: false,
          device: 'desktop' // 'desktop', 'tablet', 'mobile'
        },
  
        // Content settings
        content: {
          source: 'lorem', // 'lorem', 'wiki'
          loremParagraphs: 5,
          loremImages: 3,
          loremHeadings: 3
        },
  
        // Background settings
        backgrounds: {
          body: {
            type: 'color',
            color: {
              light: '#ffffff',
              dark: '#121212'
            },
            gradient: {
              type: 'linear',
              angle: 135,
              stops: [
                { color: { light: '#ffffff', dark: '#121212' }, position: 0 },
                { color: { light: '#f5f5f5', dark: '#2d2d2d' }, position: 100 }
              ]
            },
            pattern: {
              id: 'solid',
              colors: [
                { light: '#ffffff', dark: '#121212' },
                { light: '#f5f5f5', dark: '#2d2d2d' }
              ],
              scale: 20,
              angle: 0
            },
            texture: {
              id: 'paper',
              baseColor: { light: '#ffffff', dark: '#121212' },
              textureColor: { light: '#f5f5f5', dark: '#2d2d2d' },
              scale: 100,
              opacity: 50
            },
            image: {
              url: '',
              size: 'cover',
              scale: 100,
              position: 'center center',
              repeat: 'no-repeat',
              attachment: 'scroll'
            },
            overlay: {
              enabled: false,
              color: { light: '#000000', dark: '#ffffff' },
              opacity: 30
            }
          },
          page: {
            type: 'color',
            color: {
              light: '#ffffff',
              dark: '#1f1f1f'
            },
            overlay: {
              enabled: false,
              color: { light: '#000000', dark: '#ffffff' },
              opacity: 30
            }
          },
          hero: {
            type: 'color',
            color: {
              light: '#f8f9fa',
              dark: '#343a40'
            },
            overlay: {
              enabled: false,
              color: { light: '#000000', dark: '#ffffff' },
              opacity: 30
            }
          },
        },
  
        // Page settings
        page: {
          enabled: true,
          shadowSize: 10,
          borderSize: 1,
          borderColor: { light: '#dddddd', dark: '#444444' },
          paddingX: 40,
          paddingY: 40,
          maxWidth: 1000,
          borderRadius: 10
        },
  
        // Typography settings
        type: {
          bodyFont: "'Inter', sans-serif",
          headingFont: "'Inter', sans-serif",
          lineHeight: 1.6,
          textSize: 16,
          textColor: { light: '#333333', dark: '#f5f5f5' },
          titleSize: 36,
          titleStyle: 'normal',
          titleAlign: 'left',
          titleColor: { light: '#111111', dark: '#ffffff' },
          titlePaddingX: 0,
          titlePaddingY: 0,
          titleSpaceBelow: 30,
          headingSize: 24,
          headingStyle: 'normal',
          headingColor: { light: '#222222', dark: '#f0f0f0' },
          headingSpaceAbove: 30,
          headingSpaceBelow: 20,
          linkColor: { light: '#0066cc', dark: '#4da6ff' },
          linkHoverColor: { light: '#004080', dark: '#80bdff' },
          linkUnderline: false,
          linkHoverEffect: 'underline'
        },
  
        // Hero panel settings
        hero: {
          enabled: false,
          paddingX: 60,
          paddingY: 60,
          borderRadius: 0,
          titleEffect: 'none'
        },
  
        // Image settings
        images: {
          maxWidth: 100,
          defaultAlign: 'center',
          borderSize: 1,
          borderStyle: 'solid',
          borderColor: { light: '#dddddd', dark: '#444444' },
          borderRadius: 5,
          shadowEnabled: true,
          shadowSize: 10,
          shadowBlur: 15,
          shadowOpacity: 25,
          marginTop: 20,
          marginBottom: 20,
          padding: 0,
          captionEnabled: true,
          captionPosition: 'below',
          captionFont: 'inherit',
          captionSize: 14,
          captionStyle: 'italic',
          captionAlign: 'center',
          captionColor: { light: '#666666', dark: '#bbbbbb' },
          captionBgEnabled: false,
          captionBgColor: { light: '#f5f5f5', dark: '#333333' },
          captionBgOpacity: 80,
          brightness: 100,
          contrast: 100,
          saturation: 100,
          hoverEffect: 'none'
        },
  
        // Basic settings for other sections
        sections: {
          dividerType: 'line',
          dividerColor: { light: '#dddddd', dark: '#444444' }
        },
  
        blockquote: {},
        table: {},
        list: {},
        imageLinks: {},
  
        // Loaded fonts tracking
        loadedFonts: []
      };
    }
  };
  
  export default ThemePresets;
  