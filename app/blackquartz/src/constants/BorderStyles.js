const BORDER_STYLES = [
    // BASIC BORDERS
    // 1. Classic Solid Border
    {
      name: "Solid Border",
      generate: (params) => {
        const { 
          className,
          width = 2,
          style = 'solid', 
          color = '#333333',
          radius = 0,
          top = true,
          right = true,
          bottom = true,
          left = true 
        } = params;
        
        const sides = [];
        if (top) sides.push('border-top');
        if (right) sides.push('border-right');
        if (bottom) sides.push('border-bottom');
        if (left) sides.push('border-left');
        
        const borderStyles = sides.length === 4 
          ? `border: ${width}px ${style} ${color};` 
          : sides.map(side => `${side}: ${width}px ${style} ${color};`).join('\n  ');
        
        return `
  .${className} {
    ${borderStyles}
    ${radius > 0 ? `border-radius: ${radius}px;` : ''}
  }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 1, max: 20, default: 2, unit: "px" },
        { name: "radius", min: 0, max: 50, default: 0, unit: "px" }
      ],
      colorParams: [
        { name: "color", default: "#333333" }
      ],
      selectParams: [
        { 
          name: "style", 
          options: ['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'],
          default: 'solid'
        }
      ],
      booleanParams: [
        { name: "top", default: true },
        { name: "right", default: true },
        { name: "bottom", default: true },
        { name: "left", default: true }
      ]
    },
    
    // 2. Multi-Border (with different properties for each side)
    {
      name: "Multi-Border",
      generate: (params) => {
        const { 
          className,
          topWidth = 1,
          topStyle = 'solid',
          topColor = '#ff5555',
          rightWidth = 1,
          rightStyle = 'solid',
          rightColor = '#55ff55',
          bottomWidth = 1,
          bottomStyle = 'solid',
          bottomColor = '#5555ff',
          leftWidth = 1,
          leftStyle = 'solid',
          leftColor = '#ffff55',
          radius = 0
        } = params;
        
        return `
  .${className} {
    border-top: ${topWidth}px ${topStyle} ${topColor};
    border-right: ${rightWidth}px ${rightStyle} ${rightColor};
    border-bottom: ${bottomWidth}px ${bottomStyle} ${bottomColor};
    border-left: ${leftWidth}px ${leftStyle} ${leftColor};
    ${radius > 0 ? `border-radius: ${radius}px;` : ''}
  }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "topWidth", min: 1, max: 20, default: 1, unit: "px" },
        { name: "rightWidth", min: 1, max: 20, default: 1, unit: "px" },
        { name: "bottomWidth", min: 1, max: 20, default: 1, unit: "px" },
        { name: "leftWidth", min: 1, max: 20, default: 1, unit: "px" },
        { name: "radius", min: 0, max: 50, default: 0, unit: "px" }
      ],
      colorParams: [
        { name: "topColor", default: "#ff5555" },
        { name: "rightColor", default: "#55ff55" },
        { name: "bottomColor", default: "#5555ff" },
        { name: "leftColor", default: "#ffff55" }
      ],
      selectParams: [
        { 
          name: "topStyle", 
          options: ['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'],
          default: 'solid'
        },
        { 
          name: "rightStyle", 
          options: ['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'],
          default: 'solid'
        },
        { 
          name: "bottomStyle", 
          options: ['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'],
          default: 'solid'
        },
        { 
          name: "leftStyle", 
          options: ['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'],
          default: 'solid'
        }
      ]
    },
    
    // 3. Custom Border Radius
    {
      name: "Custom Border Radius",
      generate: (params) => {
        const { 
          className,
          width = 2,
          style = 'solid',
          color = '#333333',
          topLeftRadius = 0,
          topRightRadius = 0,
          bottomRightRadius = 0,
          bottomLeftRadius = 0
        } = params;
        
        return `
  .${className} {
    border: ${width}px ${style} ${color};
    border-radius: ${topLeftRadius}px ${topRightRadius}px ${bottomRightRadius}px ${bottomLeftRadius}px;
  }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 1, max: 20, default: 2, unit: "px" },
        { name: "topLeftRadius", min: 0, max: 100, default: 0, unit: "px" },
        { name: "topRightRadius", min: 0, max: 100, default: 0, unit: "px" },
        { name: "bottomRightRadius", min: 0, max: 100, default: 0, unit: "px" },
        { name: "bottomLeftRadius", min: 0, max: 100, default: 0, unit: "px" }
      ],
      colorParams: [
        { name: "color", default: "#333333" }
      ],
      selectParams: [
        { 
          name: "style", 
          options: ['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'],
          default: 'solid'
        }
      ]
    },
    
    // GRADIENT BORDERS
    // 4. Linear Gradient Border
    {
      name: "Linear Gradient Border",
      generate: (params) => {
        const { 
          className,
          width = 3,
          gradientAngle = 45,
          startColor = '#3498db', 
          endColor = '#e74c3c',
          radius = 4,
          borderImageSlice = 1
        } = params;
        
        return `
  .${className} {
    border: ${width}px solid;
    border-image: linear-gradient(${gradientAngle}deg, ${startColor}, ${endColor}) ${borderImageSlice};
    border-radius: ${radius}px;
  }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 1, max: 20, default: 3, unit: "px" },
        { name: "gradientAngle", min: 0, max: 360, default: 45, unit: "deg" },
        { name: "radius", min: 0, max: 50, default: 4, unit: "px" },
        { name: "borderImageSlice", min: 1, max: 100, default: 1, unit: "" }
      ],
      colorParams: [
        { name: "startColor", default: "#3498db" },
        { name: "endColor", default: "#e74c3c" }
      ]
    },
    
    // 5. Transparent Border with Gradient (specifically requested)
    {
      name: "Transparent Gradient Border",
      generate: (params) => {
        const { 
          className,
          width = 3,
          gradientAngle = 45,
          startColor = '#3498db', 
          endColor = '#e74c3c',
          radius = 8,
          backgroundColor = 'white'
        } = params;
        
        return `
  .${className} {
    border: ${width}px solid transparent;
    background: 
      linear-gradient(${backgroundColor}, ${backgroundColor}) padding-box,
      linear-gradient(${gradientAngle}deg, ${startColor}, ${endColor}) border-box;
    border-radius: ${radius}px;
  }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 1, max: 20, default: 3, unit: "px" },
        { name: "gradientAngle", min: 0, max: 360, default: 45, unit: "deg" },
        { name: "radius", min: 0, max: 50, default: 8, unit: "px" }
      ],
      colorParams: [
        { name: "startColor", default: "#3498db" },
        { name: "endColor", default: "#e74c3c" },
        { name: "backgroundColor", default: "white" }
      ]
    },
    
    // 6. Radial Gradient Border
    {
      name: "Radial Gradient Border",
      generate: (params) => {
        const { 
          className,
          width = 3,
          centerX = 50,
          centerY = 50,
          startColor = '#3498db',
          endColor = '#e74c3c',
          radius = 4,
          borderImageSlice = 1
        } = params;
        
        return `
  .${className} {
    border: ${width}px solid;
    border-image: radial-gradient(circle at ${centerX}% ${centerY}%, ${startColor}, ${endColor}) ${borderImageSlice};
    border-radius: ${radius}px;
  }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 1, max: 20, default: 3, unit: "px" },
        { name: "centerX", min: 0, max: 100, default: 50, unit: "%" },
        { name: "centerY", min: 0, max: 100, default: 50, unit: "%" },
        { name: "radius", min: 0, max: 50, default: 4, unit: "px" },
        { name: "borderImageSlice", min: 1, max: 100, default: 1, unit: "" }
      ],
      colorParams: [
        { name: "startColor", default: "#3498db" },
        { name: "endColor", default: "#e74c3c" }
      ]
    },
    
    // 7. Conic Gradient Border
    {
      name: "Conic Gradient Border",
      generate: (params) => {
        const { 
          className,
          width = 3,
          fromAngle = 0,
          color1 = '#3498db',
          color2 = '#e74c3c',
          color3 = '#2ecc71',
          color4 = '#f39c12',
          radius = 4,
          borderImageSlice = 1
        } = params;
        
        return `
  .${className} {
    border: ${width}px solid;
    border-image: conic-gradient(from ${fromAngle}deg, ${color1}, ${color2}, ${color3}, ${color4}, ${color1}) ${borderImageSlice};
    border-radius: ${radius}px;
  }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 1, max: 20, default: 3, unit: "px" },
        { name: "fromAngle", min: 0, max: 360, default: 0, unit: "deg" },
        { name: "radius", min: 0, max: 50, default: 4, unit: "px" },
        { name: "borderImageSlice", min: 1, max: 100, default: 1, unit: "" }
      ],
      colorParams: [
        { name: "color1", default: "#3498db" },
        { name: "color2", default: "#e74c3c" },
        { name: "color3", default: "#2ecc71" },
        { name: "color4", default: "#f39c12" }
      ]
    },
    
    // 8. Transparent Conic Gradient Border
    {
      name: "Transparent Conic Gradient Border",
      generate: (params) => {
        const { 
          className,
          width = 3,
          fromAngle = 0,
          color1 = '#3498db',
          color2 = '#e74c3c',
          color3 = '#2ecc71',
          color4 = '#f39c12',
          radius = 8,
          backgroundColor = 'white'
        } = params;
        
        return `
  .${className} {
    border: ${width}px solid transparent;
    background: 
      linear-gradient(${backgroundColor}, ${backgroundColor}) padding-box,
      conic-gradient(from ${fromAngle}deg, ${color1}, ${color2}, ${color3}, ${color4}, ${color1}) border-box;
    border-radius: ${radius}px;
  }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 1, max: 20, default: 3, unit: "px" },
        { name: "fromAngle", min: 0, max: 360, default: 0, unit: "deg" },
        { name: "radius", min: 0, max: 50, default: 8, unit: "px" }
      ],
      colorParams: [
        { name: "color1", default: "#3498db" },
        { name: "color2", default: "#e74c3c" },
        { name: "color3", default: "#2ecc71" },
        { name: "color4", default: "#f39c12" },
        { name: "backgroundColor", default: "white" }
      ]
    },
    
    // SHADOW BORDERS
    // 9. Shadow Border
    {
      name: "Shadow Border",
      generate: (params) => {
        const { 
          className,
          width = 3,
          color = '#3498db',
          radius = 4,
          inset = false
        } = params;
        
        return `
  .${className} {
    box-shadow: ${inset ? 'inset ' : ''}0 0 0 ${width}px ${color};
    border-radius: ${radius}px;
  }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 1, max: 20, default: 3, unit: "px" },
        { name: "radius", min: 0, max: 50, default: 4, unit: "px" }
      ],
      colorParams: [
        { name: "color", default: "#3498db" }
      ],
      booleanParams: [
        { name: "inset", default: false }
      ]
    },
    
    // 10. Multiple Shadow Borders
    {
      name: "Multiple Shadow Borders",
      generate: (params) => {
        const { 
          className,
          width1 = 3,
          color1 = '#3498db',
          width2 = 6,
          color2 = '#e74c3c',
          width3 = 9,
          color3 = '#2ecc71',
          gap1 = 0,
          gap2 = 0,
          radius = 4
        } = params;
        
        return `
  .${className} {
    box-shadow: 
      0 0 0 ${width1}px ${color1},
      0 0 0 ${width1 + gap1 + width2}px ${color2},
      0 0 0 ${width1 + gap1 + width2 + gap2 + width3}px ${color3};
    border-radius: ${radius}px;
  }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width1", min: 1, max: 10, default: 3, unit: "px" },
        { name: "width2", min: 1, max: 10, default: 6, unit: "px" },
        { name: "width3", min: 1, max: 10, default: 9, unit: "px" },
        { name: "gap1", min: 0, max: 10, default: 0, unit: "px" },
        { name: "gap2", min: 0, max: 10, default: 0, unit: "px" },
        { name: "radius", min: 0, max: 50, default: 4, unit: "px" }
      ],
      colorParams: [
        { name: "color1", default: "#3498db" },
        { name: "color2", default: "#e74c3c" },
        { name: "color3", default: "#2ecc71" }
      ]
    },
    
    // 11. Glowing Border
    {
      name: "Glowing Border",
      generate: (params) => {
        const { 
          className,
          width = 2,
          color = '#3498db',
          glowSize = 10,
          glowOpacity = 0.7,
          radius = 4
        } = params;
        
        const rgbaColor = hexToRgba(color, glowOpacity);
        
        return `
  .${className} {
    border: ${width}px solid ${color};
    box-shadow: 0 0 ${glowSize}px ${glowSize / 2}px ${rgbaColor};
    border-radius: ${radius}px;
  }
  
  /* Helper function for hex to rgba */
  @keyframes glow-pulse {
    0% { box-shadow: 0 0 ${glowSize}px ${glowSize / 2}px ${rgbaColor}; }
    50% { box-shadow: 0 0 ${glowSize * 1.5}px ${glowSize}px ${rgbaColor}; }
    100% { box-shadow: 0 0 ${glowSize}px ${glowSize / 2}px ${rgbaColor}; }
  }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 1, max: 10, default: 2, unit: "px" },
        { name: "glowSize", min: 1, max: 30, default: 10, unit: "px" },
        { name: "glowOpacity", min: 0.1, max: 1, default: 0.7, unit: "", step: 0.1 },
        { name: "radius", min: 0, max: 50, default: 4, unit: "px" }
      ],
      colorParams: [
        { name: "color", default: "#3498db" }
      ]
    },
    
    // 12. Pulsing Glow Border
    {
      name: "Pulsing Glow Border",
      generate: (params) => {
        const { 
          className,
          width = 2,
          color = '#3498db',
          glowSize = 10,
          glowOpacity = 0.7,
          animationDuration = 2,
          radius = 4
        } = params;
        
        const rgbaColor = hexToRgba(color, glowOpacity);
        
        return `
  .${className} {
    border: ${width}px solid ${color};
    border-radius: ${radius}px;
    animation: ${className}-pulse ${animationDuration}s ease-in-out infinite;
  }
  
  @keyframes ${className}-pulse {
    0% { box-shadow: 0 0 ${glowSize}px ${Math.floor(glowSize / 2)}px ${rgbaColor}; }
    50% { box-shadow: 0 0 ${glowSize * 1.5}px ${glowSize}px ${rgbaColor}; }
    100% { box-shadow: 0 0 ${glowSize}px ${Math.floor(glowSize / 2)}px ${rgbaColor}; }
  }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 1, max: 10, default: 2, unit: "px" },
        { name: "glowSize", min: 1, max: 30, default: 10, unit: "px" },
        { name: "glowOpacity", min: 0.1, max: 1, default: 0.7, unit: "", step: 0.1 },
        { name: "animationDuration", min: 0.5, max: 10, default: 2, unit: "s", step: 0.5 },
        { name: "radius", min: 0, max: 50, default: 4, unit: "px" }
      ],
      colorParams: [
        { name: "color", default: "#3498db" }
      ]
    },
    
    // OUTLINE BORDERS
    // 13. Outline Border
    {
      name: "Outline Border",
      generate: (params) => {
        const { 
          className,
          width = 2,
          style = 'solid',
          color = '#3498db',
          offset = 5,
          radius = 4
        } = params;
        
        return `
  .${className} {
    outline: ${width}px ${style} ${color};
    outline-offset: ${offset}px;
    border-radius: ${radius}px;
  }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 1, max: 20, default: 2, unit: "px" },
        { name: "offset", min: -20, max: 20, default: 5, unit: "px" },
        { name: "radius", min: 0, max: 50, default: 4, unit: "px" }
      ],
      colorParams: [
        { name: "color", default: "#3498db" }
      ],
      selectParams: [
        { 
          name: "style", 
          options: ['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'],
          default: 'solid'
        }
      ]
    },
    
    // 14. Double Border with Outline
    {
      name: "Double Border with Outline",
      generate: (params) => {
        const { 
          className,
          borderWidth = 2,
          borderColor = '#3498db',
          outlineWidth = 2,
          outlineColor = '#e74c3c',
          outlineOffset = 5,
          radius = 4
        } = params;
        
        return `
  .${className} {
    border: ${borderWidth}px solid ${borderColor};
    outline: ${outlineWidth}px solid ${outlineColor};
    outline-offset: ${outlineOffset}px;
    border-radius: ${radius}px;
  }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "borderWidth", min: 1, max: 10, default: 2, unit: "px" },
        { name: "outlineWidth", min: 1, max: 10, default: 2, unit: "px" },
        { name: "outlineOffset", min: -10, max: 20, default: 5, unit: "px" },
        { name: "radius", min: 0, max: 50, default: 4, unit: "px" }
      ],
      colorParams: [
        { name: "borderColor", default: "#3498db" },
        { name: "outlineColor", default: "#e74c3c" }
      ]
    },
    
    // 15. Triple Border Effect
    {
      name: "Triple Border Effect",
      generate: (params) => {
        const { 
          className,
          borderWidth = 2,
          borderColor = '#3498db',
          outlineWidth = 2,
          outlineColor = '#e74c3c',
          shadowWidth = 2,
          shadowColor = '#2ecc71',
          outlineOffset = 5,
          shadowOffset = 10,
          radius = 4
        } = params;
        
        return `
  .${className} {
    border: ${borderWidth}px solid ${borderColor};
    outline: ${outlineWidth}px solid ${outlineColor};
    outline-offset: ${outlineOffset}px;
    box-shadow: 0 0 0 ${shadowOffset}px ${shadowColor};
    border-radius: ${radius}px;
  }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "borderWidth", min: 1, max: 10, default: 2, unit: "px" },
        { name: "outlineWidth", min: 1, max: 10, default: 2, unit: "px" },
        { name: "shadowWidth", min: 1, max: 10, default: 2, unit: "px" },
        { name: "outlineOffset", min: 1, max: 15, default: 5, unit: "px" },
        { name: "shadowOffset", min: 5, max: 25, default: 10, unit: "px" },
        { name: "radius", min: 0, max: 50, default: 4, unit: "px" }
      ],
      colorParams: [
        { name: "borderColor", default: "#3498db" },
        { name: "outlineColor", default: "#e74c3c" },
        { name: "shadowColor", default: "#2ecc71" }
      ]
    },
    
    // ANIMATED BORDERS
    // 16. Animated Dashed Border
    {
      name: "Animated Dashed Border",
      generate: (params) => {
        const { 
          className,
          width = 2,
          color = '#3498db',
          dashLength = 10,
          dashGap = 5,
          animationDuration = 15,
          animationDirection = 'normal',
          radius = 4
        } = params;
        
        return `
  .${className} {
    border: ${width}px dashed ${color};
    border-radius: ${radius}px;
    background-size: ${dashLength + dashGap}px ${dashLength + dashGap}px;
    animation: ${className}-dash ${animationDuration}s ${animationDirection} infinite linear;
  }
  
  @keyframes ${className}-dash {
    to { background-position: 100% 0; }
  }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 1, max: 10, default: 2, unit: "px" },
        { name: "dashLength", min: 1, max: 50, default: 10, unit: "px" },
        { name: "dashGap", min: 1, max: 50, default: 5, unit: "px" },
        { name: "animationDuration", min: 1, max: 30, default: 15, unit: "s" },
        { name: "radius", min: 0, max: 50, default: 4, unit: "px" }
      ],
      colorParams: [
        { name: "color", default: "#3498db" }
      ],
      selectParams: [
        { 
          name: "animationDirection", 
          options: ['normal', 'reverse', 'alternate', 'alternate-reverse'],
          default: 'normal'
        }
      ]
    },
    
    // 17. Animated Gradient Border
    {
      name: "Animated Gradient Border",
      generate: (params) => {
        const { 
          className,
          width = 3,
          color1 = '#3498db',
          color2 = '#e74c3c',
          color3 = '#2ecc71',
          color4 = '#f39c12',
          animationDuration = 3,
          radius = 8,
          backgroundColor = 'white'
        } = params;
        
        return `
  .${className} {
    position: relative;
    border-radius: ${radius}px;
    background: ${backgroundColor};
  }
  
  .${className}::before {
    content: '';
    position: absolute;
    top: -${width}px;
    left: -${width}px;
    right: -${width}px;
    bottom: -${width}px;
    background: linear-gradient(45deg, ${color1}, ${color2}, ${color3}, ${color4});
    background-size: 400% 400%;
    border-radius: ${radius + width}px;
    z-index: -1;
    animation: ${className}-gradient ${animationDuration}s ease infinite;
  }
  
  @keyframes ${className}-gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 1, max: 20, default: 3, unit: "px" },
        { name: "animationDuration", min: 1, max: 20, default: 3, unit: "s" },
        { name: "radius", min: 0, max: 50, default: 8, unit: "px" }
      ],
      colorParams: [
        { name: "color1", default: "#3498db" },
        { name: "color2", default: "#e74c3c" },
        { name: "color3", default: "#2ecc71" },
        { name: "color4", default: "#f39c12" },
        { name: "backgroundColor", default: "white" }
      ]
    },
    
    // 18. Rotating Border
    {
      name: "Rotating Gradient Border",
      generate: (params) => {
        const { 
          className,
          width = 3,
          color1 = '#3498db',
          color2 = '#e74c3c',
          color3 = '#2ecc71',
          color4 = '#f39c12',
          animationDuration = 8,
          radius = 8,
          backgroundColor = 'white'
        } = params;
        
        return `
  .${className} {
    border: ${width}px solid transparent;
    background: 
      linear-gradient(${backgroundColor}, ${backgroundColor}) padding-box,
      conic-gradient(${color1}, ${color2}, ${color3}, ${color4}, ${color1}) border-box;
    border-radius: ${radius}px;
    animation: ${className}-rotate ${animationDuration}s linear infinite;
  }
  
  @keyframes ${className}-rotate {
    to { filter: hue-rotate(360deg); }
  }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 1, max: 20, default: 3, unit: "px" },
        { name: "animationDuration", min: 1, max: 20, default: 8, unit: "s" },
        { name: "radius", min: 0, max: 50, default: 8, unit: "px" }
      ],
      colorParams: [
        { name: "color1", default: "#3498db" },
        { name: "color2", default: "#e74c3c" },
        { name: "color3", default: "#2ecc71" },
        { name: "color4", default: "#f39c12" },
        { name: "backgroundColor", default: "white" }
      ]
    },
    
    // CREATIVE BORDERS
    // 19. Zig-Zag Border
    {
      name: "Zig-Zag Border",
      generate: (params) => {
        const { 
          className,
          color = '#3498db',
          zigzagSize = 8,
          backgroundColor = 'white',
          radius = 0
        } = params;
        
        return `
  .${className} {
    position: relative;
    background-color: ${backgroundColor};
    border-radius: ${radius}px;
  }
  
  .${className}::before {
    content: '';
    position: absolute;
    inset: -${zigzagSize * 1.5}px;
    background-color: ${color};
    --mask: 
      conic-gradient(from 135deg at top,#0000,#000 1deg 89deg,#0000 90deg) 0 0/${zigzagSize}px 51% repeat-x,
      conic-gradient(from -45deg at bottom,#0000,#000 1deg 89deg,#0000 90deg) 0 100%/${zigzagSize}px 51% repeat-x;
    -webkit-mask: var(--mask);
    mask: var(--mask);
    z-index: -1;
  }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "zigzagSize", min: 4, max: 30, default: 8, unit: "px" },
        { name: "radius", min: 0, max: 50, default: 0, unit: "px" }
      ],
      colorParams: [
        { name: "color", default: "#3498db" },
        { name: "backgroundColor", default: "white" }
      ]
    },
    
    // 20. Scalloped Border
    {
      name: "Scalloped Border",
      generate: (params) => {
        const { 
          className,
          color = '#3498db',
          scalloped = 12,
          backgroundColor = 'white',
          radius = 0
        } = params;
        
        return `
  .${className} {
    position: relative;
    background-color: ${backgroundColor};
    border-radius: ${radius}px;
  }
  
  .${className}::before {
    content: '';
    position: absolute;
    top: -${scalloped * 2}px;
    left: -${scalloped * 2}px;
    right: -${scalloped * 2}px;
    bottom: -${scalloped * 2}px;
    z-index: -1;
    background-color: ${color};
    background-image: 
      radial-gradient(circle at ${scalloped}px ${scalloped}px, transparent ${scalloped}px, ${color} ${scalloped}px);
    background-size: ${scalloped * 2}px ${scalloped * 2}px;
  }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "scalloped", min: 5, max: 30, default: 12, unit: "px" },
        { name: "radius", min: 0, max: 50, default: 0, unit: "px" }
      ],
      colorParams: [
        { name: "color", default: "#3498db" },
        { name: "backgroundColor", default: "white" }
      ]
    },
    
    // 21. Rainbow Border
    {
      name: "Rainbow Border",
      generate: (params) => {
        const { 
          className,
          width1 = 5,
          width2 = 5,
          width3 = 5,
          width4 = 5,
          width5 = 5,
          width6 = 5,
          color1 = '#f35b5b',
          color2 = '#f5a623',
          color3 = '#f8e71c',
          color4 = '#7ed321',
          color5 = '#4a90e2',
          color6 = '#9013fe',
          spacing = 0,
          radius = 4
        } = params;
        
        const totalWidth = width1 + width2 + width3 + width4 + width5 + width6 + (spacing * 5);
        
        return `
  .${className} {
    box-shadow:
      0 0 0 ${width1}px ${color1},
      0 0 0 ${width1 + spacing + width2}px ${color2},
      0 0 0 ${width1 + spacing + width2 + spacing + width3}px ${color3},
      0 0 0 ${width1 + spacing + width2 + spacing + width3 + spacing + width4}px ${color4},
      0 0 0 ${width1 + spacing + width2 + spacing + width3 + spacing + width4 + spacing + width5}px ${color5},
      0 0 0 ${width1 + spacing + width2 + spacing + width3 + spacing + width4 + spacing + width5 + spacing + width6}px ${color6};
    border-radius: ${radius}px;
  }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width1", min: 1, max: 10, default: 5, unit: "px" },
        { name: "width2", min: 1, max: 10, default: 5, unit: "px" },
        { name: "width3", min: 1, max: 10, default: 5, unit: "px" },
        { name: "width4", min: 1, max: 10, default: 5, unit: "px" },
        { name: "width5", min: 1, max: 10, default: 5, unit: "px" },
        { name: "width6", min: 1, max: 10, default: 5, unit: "px" },
        { name: "spacing", min: 0, max: 10, default: 0, unit: "px" },
        { name: "radius", min: 0, max: 50, default: 4, unit: "px" }
      ],
      colorParams: [
        { name: "color1", default: "#f35b5b" },
        { name: "color2", default: "#f5a623" },
        { name: "color3", default: "#f8e71c" },
        { name: "color4", default: "#7ed321" },
        { name: "color5", default: "#4a90e2" },
        { name: "color6", default: "#9013fe" }
      ]
    },
    
    // 22. Text in Border
    {
      name: "Text in Border",
      generate: (params) => {
        const { 
          className,
          width = 2,
          color = '#3498db',
          text = "Border Text • ",
          textSize = 10,
          textColor = '#3498db',
          animationDuration = 10,
          radius = 8,
          backgroundColor = 'white'
        } = params;
        
        return `
  .${className} {
    position: relative;
    box-sizing: border-box;
    border: ${width}px solid transparent;
    background-clip: padding-box;
    background-color: ${backgroundColor};
    border-radius: ${radius}px;
  }
  
  .${className}::before {
    content: "${text.repeat(2)}";
    position: absolute;
    top: -${width}px;
    bottom: -${width}px;
    left: -${width}px;
    right: -${width}px;
    background: ${backgroundColor};
    border: ${width}px solid ${color};
    border-radius: ${radius}px;
    color: ${textColor};
    font-size: ${textSize}px;
    overflow: hidden;
    white-space: nowrap;
    line-height: 1;
    padding: 0;
    z-index: -1;
    animation: ${className}-text-scroll ${animationDuration}s linear infinite;
  }
  
  @keyframes ${className}-text-scroll {
    to { background-position: 100% 0; }
  }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 1, max: 10, default: 2, unit: "px" },
        { name: "textSize", min: 6, max: 20, default: 10, unit: "px" },
        { name: "animationDuration", min: 1, max: 30, default: 10, unit: "s" },
        { name: "radius", min: 0, max: 50, default: 8, unit: "px" }
      ],
      colorParams: [
        { name: "color", default: "#3498db" },
        { name: "textColor", default: "#3498db" },
        { name: "backgroundColor", default: "white" }
      ],
      textParams: [
        { name: "text", default: "Border Text • " }
      ]
    },
    
    // 23. Clip-Path Border
    {
      name: "Clip-Path Border",
      generate: (params) => {
        const { 
          className,
          cornerSize = 20,
          color = '#3498db',
          backgroundColor = 'white'
        } = params;
        
        return `
  .${className} {
    position: relative;
    background-color: ${backgroundColor};
  }
  
  .${className}::before {
    content: '';
    position: absolute;
    inset: -10px;
    background-color: ${color};
    z-index: -1;
    clip-path: polygon(
      0% ${cornerSize}px, 
      ${cornerSize}px 0%, 
      calc(100% - ${cornerSize}px) 0%, 
      100% ${cornerSize}px, 
      100% calc(100% - ${cornerSize}px), 
      calc(100% - ${cornerSize}px) 100%, 
      ${cornerSize}px 100%, 
      0% calc(100% - ${cornerSize}px)
    );
  }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "cornerSize", min: 5, max: 50, default: 20, unit: "px" }
      ],
      colorParams: [
        { name: "color", default: "#3498db" },
        { name: "backgroundColor", default: "white" }
      ]
    },
    
    // 24. Pattern Stripe Border
    {
      name: "Pattern Stripe Border",
      generate: (params) => {
        const { 
          className,
          width = 20,
          stripeWidth = 10,
          color1 = '#3498db',
          color2 = '#e74c3c',
          backgroundColor = 'white',
          angle = 45
        } = params;
        
        return `
  .${className} {
    position: relative;
    padding: ${width}px;
    background: ${backgroundColor};
  }
  
  .${className}::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      repeating-linear-gradient(${angle}deg, ${color1}, ${color1} ${stripeWidth}px, transparent ${stripeWidth}px, transparent ${stripeWidth * 2}px),
      repeating-linear-gradient(${angle + 90}deg, ${color2}, ${color2} ${stripeWidth}px, transparent ${stripeWidth}px, transparent ${stripeWidth * 2}px);
    background-size: 100% 100%;
    background-position: 0 0;
    border: ${width}px solid transparent;
    -webkit-mask: 
      linear-gradient(white 0 0) content-box,
      linear-gradient(white 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 5, max: 50, default: 20, unit: "px" },
        { name: "stripeWidth", min: 2, max: 30, default: 10, unit: "px" },
        { name: "angle", min: 0, max: 360, default: 45, unit: "deg" }
      ],
      colorParams: [
        { name: "color1", default: "#3498db" },
        { name: "color2", default: "#e74c3c" },
        { name: "backgroundColor", default: "white" }
      ]
    },
    
    // 25. Striped Border
    {
      name: "Striped Conic Border",
      generate: (params) => {
        const { 
          className,
          size = 60,
          color1 = '#3498db',
          color2 = 'white',
          backgroundColor = 'white'
        } = params;
        
        return `
  .${className} {
    --s: ${size}px; /* control the size */
    --c1: ${color1};
    --c2: ${color2};
    
    background-color: ${backgroundColor};
    padding: calc(var(--s)/2);
    background:
      repeating-conic-gradient(var(--c1) 0 25%, var(--c2) 0 50%) 
      0 0/var(--s) var(--s) round;
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "size", min: 20, max: 100, default: 60, unit: "px" }
      ],
      colorParams: [
        { name: "color1", default: "#3498db" },
        { name: "color2", default: "white" },
        { name: "backgroundColor", default: "white" }
      ]
    },
    
    // 26. Corner Borders
    {
      name: "Corner Borders",
      generate: (params) => {
        const { 
          className,
          width = 5,
          cornerLength = 30,
          color = '#3498db',
          allCorners = true,
          topLeft = true,
          topRight = true,
          bottomLeft = true,
          bottomRight = true
        } = params;
        
        const corners = allCorners ? 
          { topLeft: true, topRight: true, bottomLeft: true, bottomRight: true } : 
          { topLeft, topRight, bottomLeft, bottomRight };
        
        return `
  .${className} {
    position: relative;
    border: none;
  }
  
  ${corners.topLeft ? `
  .${className}::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: ${cornerLength}px;
    height: ${cornerLength}px;
    border-top: ${width}px solid ${color};
    border-left: ${width}px solid ${color};
  }` : ''}
  
  ${corners.topRight ? `
  .${className}::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: ${cornerLength}px;
    height: ${cornerLength}px;
    border-top: ${width}px solid ${color};
    border-right: ${width}px solid ${color};
  }` : ''}
  
  ${(corners.bottomLeft || corners.bottomRight) ? `
  .${className} > span::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: ${cornerLength}px;
    height: ${cornerLength}px;
    border-bottom: ${width}px solid ${color};
    border-left: ${width}px solid ${color};
    display: ${corners.bottomLeft ? 'block' : 'none'};
  }
  
  .${className} > span::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: ${cornerLength}px;
    height: ${cornerLength}px;
    border-bottom: ${width}px solid ${color};
    border-right: ${width}px solid ${color};
    display: ${corners.bottomRight ? 'block' : 'none'};
  }` : ''}`;
      },
      html: (className) => `<div class="${className}"><span></span></div>`,
      numericParams: [
        { name: "width", min: 1, max: 20, default: 5, unit: "px" },
        { name: "cornerLength", min: 10, max: 100, default: 30, unit: "px" }
      ],
      colorParams: [
        { name: "color", default: "#3498db" }
      ],
      booleanParams: [
        { name: "allCorners", default: true },
        { name: "topLeft", default: true },
        { name: "topRight", default: true },
        { name: "bottomLeft", default: true },
        { name: "bottomRight", default: true }
      ]
    },
    
    // 27. Blob Shape Border
    {
      name: "Blob Shape Border",
      generate: (params) => {
        const { 
          className,
          width = 3,
          color = '#3498db',
          radius1 = 42,
          radius2 = 58,
          radius3 = 70,
          radius4 = 30,
          radius5 = 45,
          radius6 = 45,
          radius7 = 55,
          radius8 = 55,
          backgroundColor = 'white'
        } = params;
        
        return `
  .${className} {
    border: ${width}px solid ${color};
    border-radius: ${radius1}% ${radius2}% ${radius3}% ${radius4}% / ${radius5}% ${radius6}% ${radius7}% ${radius8}%;
    background-color: ${backgroundColor};
  }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 1, max: 10, default: 3, unit: "px" },
        { name: "radius1", min: 10, max: 90, default: 42, unit: "%" },
        { name: "radius2", min: 10, max: 90, default: 58, unit: "%" },
        { name: "radius3", min: 10, max: 90, default: 70, unit: "%" },
        { name: "radius4", min: 10, max: 90, default: 30, unit: "%" },
        { name: "radius5", min: 10, max: 90, default: 45, unit: "%" },
        { name: "radius6", min: 10, max: 90, default: 45, unit: "%" },
        { name: "radius7", min: 10, max: 90, default: 55, unit: "%" },
        { name: "radius8", min: 10, max: 90, default: 55, unit: "%" },
      ],
      colorParams: [
        { name: "color", default: "#3498db" },
        { name: "backgroundColor", default: "white" }
      ]
    },
    
    // 28. Cut Corners Border
    {
      name: "Cut Corners Border",
      generate: (params) => {
        const { 
          className,
          cornerSize = 20,
          color = '#3498db',
          backgroundColor = 'white'
        } = params;
        
        return `
  .${className} {
    position: relative;
    background-color: ${backgroundColor};
  }
  
  .${className}::before {
    content: '';
    position: absolute;
    inset: -5px;
    background-color: ${color};
    z-index: -1;
    clip-path: polygon(
      ${cornerSize}px 0%, 
      calc(100% - ${cornerSize}px) 0%, 
      100% ${cornerSize}px, 
      100% calc(100% - ${cornerSize}px), 
      calc(100% - ${cornerSize}px) 100%, 
      ${cornerSize}px 100%, 
      0% calc(100% - ${cornerSize}px), 
      0% ${cornerSize}px
    );
  }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "cornerSize", min: 5, max: 50, default: 20, unit: "px" }
      ],
      colorParams: [
        { name: "color", default: "#3498db" },
        { name: "backgroundColor", default: "white" }
      ]
    },
    
    // 29. Responsive Border (vw/vh units)
    {
      name: "Responsive Border",
      generate: (params) => {
        const { 
          className,
          widthVw = 1,
          widthVh = 0,
          style = 'solid',
          color = '#3498db',
          radiusVmin = 0.5,
          radiusVMax = 0
        } = params;
        
        return `
  .${className} {
    border: calc(${widthVw}vw + ${widthVh}vh) ${style} ${color};
    border-radius: calc(${radiusVmin}vmin + ${radiusVMax}vmax);
  }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "widthVw", min: 0, max: 5, default: 1, unit: "vw", step: 0.1 },
        { name: "widthVh", min: 0, max: 5, default: 0, unit: "vh", step: 0.1 },
        { name: "radiusVmin", min: 0, max: 5, default: 0.5, unit: "vmin", step: 0.1 },
        { name: "radiusVMax", min: 0, max: 5, default: 0, unit: "vmax", step: 0.1 }
      ],
      colorParams: [
        { name: "color", default: "#3498db" }
      ],
      selectParams: [
        { 
          name: "style", 
          options: ['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'],
          default: 'solid'
        }
      ]
    },
    
    // 30. Inner Shadow Border
    {
      name: "Inner Shadow Border",
      generate: (params) => {
        const { 
          className,
          width = 2,
          color = '#3498db',
          shadowBlur = 10,
          shadowSpread = 0,
          shadowColor = 'rgba(0, 0, 0, 0.3)',
          radius = 8
        } = params;
        
        return `
  .${className} {
    border: ${width}px solid ${color};
    border-radius: ${radius}px;
    box-shadow: inset 0 0 ${shadowBlur}px ${shadowSpread}px ${shadowColor};
  }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 1, max: 10, default: 2, unit: "px" },
        { name: "shadowBlur", min: 0, max: 30, default: 10, unit: "px" },
        { name: "shadowSpread", min: -10, max: 20, default: 0, unit: "px" },
        { name: "radius", min: 0, max: 50, default: 8, unit: "px" }
      ],
      colorParams: [
        { name: "color", default: "#3498db" },
        { name: "shadowColor", default: "rgba(0, 0, 0, 0.3)" }
      ]
    },
    
    // 31. Dashed Gradient Border
    {
      name: "Dashed Gradient Border",
      generate: (params) => {
        const { 
          className,
          width = 2,
          dashLength = 10,
          dashGap = 5,
          startColor = '#3498db',
          endColor = '#e74c3c',
          borderStyle = 'dashed',
          radius = 4,
          gradientAngle = 45
        } = params;
        
        return `
  .${className} {
    --border-gradient: linear-gradient(${gradientAngle}deg, ${startColor}, ${endColor});
    background-image: linear-gradient(white, white), var(--border-gradient);
    background-origin: border-box;
    background-clip: padding-box, border-box;
    border: ${width}px ${borderStyle} transparent;
    border-radius: ${radius}px;
  }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 1, max: 10, default: 2, unit: "px" },
        { name: "dashLength", min: 1, max: 30, default: 10, unit: "px" },
        { name: "dashGap", min: 1, max: 30, default: 5, unit: "px" },
        { name: "radius", min: 0, max: 50, default: 4, unit: "px" },
        { name: "gradientAngle", min: 0, max: 360, default: 45, unit: "deg" }
      ],
      colorParams: [
        { name: "startColor", default: "#3498db" },
        { name: "endColor", default: "#e74c3c" }
      ],
      selectParams: [
        { 
          name: "borderStyle", 
          options: ['solid', 'dashed', 'dotted'],
          default: 'dashed'
        }
      ]
    },
    
    // 32. Layered Border with Shadows
    {
      name: "Layered Border with Shadows",
      generate: (params) => {
        const { 
          className,
          width = 2,
          color = '#3498db',
          shadowColor = 'rgba(0, 0, 0, 0.2)',
          shadowBlur = 10,
          shadowDistance = 5,
          radius = 8
        } = params;
        
        return `
  .${className} {
    border: ${width}px solid ${color};
    border-radius: ${radius}px;
    box-shadow: 
      0 ${shadowDistance}px ${shadowBlur}px ${shadowColor},
      0 ${shadowDistance * 0.5}px ${shadowBlur * 0.5}px ${shadowColor},
      0 ${shadowDistance * 0.25}px ${shadowBlur * 0.25}px ${shadowColor};
  }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 1, max: 10, default: 2, unit: "px" },
        { name: "shadowBlur", min: 0, max: 30, default: 10, unit: "px" },
        { name: "shadowDistance", min: 0, max: 20, default: 5, unit: "px" },
        { name: "radius", min: 0, max: 50, default: 8, unit: "px" }
      ],
      colorParams: [
        { name: "color", default: "#3498db" },
        { name: "shadowColor", default: "rgba(0, 0, 0, 0.2)" }
      ]
    },
    
    // 33. Image Border Frame
    {
      name: "Image Border Frame",
      generate: (params) => {
        const { 
          className,
          width = 30,
          cornerSize = 50,
          color = '#3498db',
          radius = 0
        } = params;
        
        return `
  .${className} {
    position: relative;
    background-color: white;
    padding: ${width}px;
    border-radius: ${radius}px;
  }
  
  .${className}::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${color};
    border-radius: ${radius}px;
    -webkit-mask:
      linear-gradient(to right, #000 ${cornerSize}%, transparent 0) 0 0,
      linear-gradient(to right, transparent ${100 - cornerSize}%, #000 0) 0 100%,
      linear-gradient(to bottom, #000 ${cornerSize}%, transparent 0) 0 0,
      linear-gradient(to bottom, transparent ${100 - cornerSize}%, #000 0) 100% 0;
    -webkit-mask-size: 51% ${width * 2}px, 51% ${width * 2}px, ${width * 2}px 51%, ${width * 2}px 51%;
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-composite: destination-in;
    mask-composite: intersect;
  }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 10, max: 80, default: 30, unit: "px" },
        { name: "cornerSize", min: 10, max: 90, default: 50, unit: "%" },
        { name: "radius", min: 0, max: 50, default: 0, unit: "px" }
      ],
      colorParams: [
        { name: "color", default: "#3498db" }
      ]
    }
  ];
  
  // Helper function for hexToRgba
  function hexToRgba(hex, opacity) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  // Example usage:
  // const borderStyles = BORDER_STYLES[0].generate({ className: 'my-border' });
  // console.log(borderStyles);
  
  export default BORDER_STYLES;
  