export function convertHexToRgba(hex, opacity) {
  if (typeof hex !== 'string' || !hex.startsWith('#')) {
    return hex;
  }
  const trimmedHex = hex.replace('#', '');
  if (trimmedHex.length !== 3 && trimmedHex.length !== 6) {
    return hex;
  }
  let r, g, b;
  if (trimmedHex.length === 3) {
    r = parseInt(trimmedHex.charAt(0) + trimmedHex.charAt(0), 16);
    g = parseInt(trimmedHex.charAt(1) + trimmedHex.charAt(1), 16);
    b = parseInt(trimmedHex.charAt(2) + trimmedHex.charAt(2), 16);
  } else {
    r = parseInt(trimmedHex.slice(0, 2), 16);
    g = parseInt(trimmedHex.slice(2, 4), 16);
    b = parseInt(trimmedHex.slice(4, 6), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function getBackgroundStyle(color, opacity, themeColorArray = null, enableOpacity = true) {
  let backgroundColor;
  if (typeof color === 'object' && color.light) {
    backgroundColor = color.light;
  } else if (typeof color === 'number') {
    // Use theme color if available
    if (themeColorArray && Array.isArray(themeColorArray)) {
      backgroundColor = themeColorArray[color - 1] || '#FFFFFF';
    } else {
      backgroundColor = '#FFFFFF';
    }
  } else {
    backgroundColor = color;
  }
  
  if (enableOpacity && opacity !== undefined && opacity < 1) {
    if (backgroundColor && backgroundColor.startsWith('#')) {
      return { backgroundColor: convertHexToRgba(backgroundColor, opacity) };
    } else {
      return { backgroundColor, opacity };
    }
  } else {
    return { backgroundColor };
  }
} 