import ThemeUtils from './ThemeUtils';
import { CONSTANTS } from '../constants';

// CSS Style Generator for component previews
export const getBackgroundStyle=(bgSettings, mode)=>{
    if (!bgSettings) {
      return { backgroundColor: '#ffffff' }; // Default fallback
    }

    const { type } = bgSettings;

    if (type === 'color') {
      const color = ThemeUtils.getCurrentColor(bgSettings.color || { light: '#ffffff', dark: '#121212' }, mode);
      return { backgroundColor: color };
    } else if (type === 'gradient' && bgSettings.gradient) {
      const { gradient } = bgSettings;
      const stops = gradient.stops.map(stop => {
        const stopColor = ThemeUtils.getCurrentColor(stop.color, mode);
        return `${stopColor} ${stop.position}%`;
      }).join(', ');

      if (gradient.type === 'linear') {
        return { background: `linear-gradient(${gradient.angle}deg, ${stops})` };
      } else if (gradient.type === 'radial') {
        return { background: `radial-gradient(circle, ${stops})` };
      } else if (gradient.type === 'conic') {
        return { background: `conic-gradient(from 0deg, ${stops})` };
      }
    } else if (type === 'pattern' && bgSettings.pattern) {
      const pattern = CONSTANTS.PATTERNS.find(p => p.id === bgSettings.pattern.id);
      if (pattern) {
        // Get colors for current mode
        const patternColors = bgSettings.pattern.colors.map(color =>
          ThemeUtils.getCurrentColor(color, mode)
        );

        // Convert pattern.css output to style object
        const cssText = pattern.css(
          patternColors,
          bgSettings.pattern.scale,
          bgSettings.pattern.angle
        );

        return cssText;
      }
    } else if (type === 'texture' && bgSettings.texture) {
      const texture = CONSTANTS.TEXTURES.find(t => t.id === bgSettings.texture.id);
      if (texture) {
        const baseColor = ThemeUtils.getCurrentColor(bgSettings.texture.baseColor, mode);

        return {
          backgroundColor: baseColor,
          backgroundImage: `url(${texture.url})`,
          backgroundSize: `${bgSettings.texture.scale}%`,
          backgroundBlendMode: 'multiply',
          opacity: bgSettings.texture.opacity / 100 + 0.5
        };
      }
    } else if (type === 'image' && bgSettings.image) {
      const { image } = bgSettings;

      // Check if image.url exists to prevent errors
      if (image.url) {
        return {
          backgroundImage: `url(${image.url})`,
          backgroundSize: image.size === 'custom' ? `${image.scale}%` : image.size,
          backgroundPosition: image.position,
          backgroundRepeat: image.repeat,
          backgroundAttachment: image.attachment
        };
      }
    }

    // Default
    return { backgroundColor: '#ffffff' };
  };

