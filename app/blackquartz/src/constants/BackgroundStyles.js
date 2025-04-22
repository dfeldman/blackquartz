const BACKGROUND_STYLES = [
    // 1. SOLID COLOR BACKGROUND
    {
      name: "Solid Color",
      generate: (params) => {
        const { 
          className,
          color = '#f0f0f0'
        } = params;
        
        return `
    .${className} {
      background-color: ${color};
    }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      colorParams: [
        { name: "color", default: "#f0f0f0" }
      ]
    },
    
    // 2. IMAGE BACKGROUND
    {
      name: "Image Background",
      generate: (params) => {
        const { 
          className,
          imageUrl = 'url("/path/to/image.jpg")',
          size = 'cover',
          position = 'center',
          repeat = 'no-repeat',
          attachment = 'scroll',
          blur = 0,
          brightness = 100,
          contrast = 100,
          grayscale = 0,
          hueRotate = 0,
          invert = 0,
          opacity = 100,
          saturate = 100,
          sepia = 0,
          rotation = 0,
          overlay = false,
          overlayColor = 'rgba(0, 0, 0, 0.5)'
        } = params;
        
        const filters = [];
        if (blur > 0) filters.push(`blur(${blur}px)`);
        if (brightness !== 100) filters.push(`brightness(${brightness}%)`);
        if (contrast !== 100) filters.push(`contrast(${contrast}%)`);
        if (grayscale > 0) filters.push(`grayscale(${grayscale}%)`);
        if (hueRotate !== 0) filters.push(`hue-rotate(${hueRotate}deg)`);
        if (invert > 0) filters.push(`invert(${invert}%)`);
        if (opacity !== 100) filters.push(`opacity(${opacity}%)`);
        if (saturate !== 100) filters.push(`saturate(${saturate}%)`);
        if (sepia > 0) filters.push(`sepia(${sepia}%)`);
        
        const filterStyle = filters.length > 0 ? `filter: ${filters.join(' ')};` : '';
        const transformStyle = rotation !== 0 ? `transform: rotate(${rotation}deg);` : '';
        
        const overlayStyle = overlay ? `
      position: relative;
    }
    
    .${className}::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: ${overlayColor};
      z-index: 1;` : '';
        
        return `
    .${className} {
      background-image: ${imageUrl};
      background-size: ${size};
      background-position: ${position};
      background-repeat: ${repeat};
      background-attachment: ${attachment};
      ${filterStyle}
      ${transformStyle}
      ${overlayStyle}
    }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      textParams: [
        { name: "imageUrl", default: 'url("/path/to/image.jpg")' }
      ],
      selectParams: [
        { 
          name: "size", 
          options: ['cover', 'contain', 'auto', '100% 100%', '100% auto', 'auto 100%'],
          default: 'cover'
        },
        { 
          name: "position", 
          options: ['center', 'top', 'right', 'bottom', 'left', 'top left', 'top right', 'bottom left', 'bottom right'],
          default: 'center'
        },
        { 
          name: "repeat", 
          options: ['no-repeat', 'repeat', 'repeat-x', 'repeat-y', 'space', 'round'],
          default: 'no-repeat'
        },
        { 
          name: "attachment", 
          options: ['scroll', 'fixed', 'local'],
          default: 'scroll'
        }
      ],
      numericParams: [
        { name: "blur", min: 0, max: 20, default: 0, unit: "px" },
        { name: "brightness", min: 0, max: 200, default: 100, unit: "%" },
        { name: "contrast", min: 0, max: 200, default: 100, unit: "%" },
        { name: "grayscale", min: 0, max: 100, default: 0, unit: "%" },
        { name: "hueRotate", min: 0, max: 360, default: 0, unit: "deg" },
        { name: "invert", min: 0, max: 100, default: 0, unit: "%" },
        { name: "opacity", min: 0, max: 100, default: 100, unit: "%" },
        { name: "saturate", min: 0, max: 300, default: 100, unit: "%" },
        { name: "sepia", min: 0, max: 100, default: 0, unit: "%" },
        { name: "rotation", min: 0, max: 360, default: 0, unit: "deg" }
      ],
      booleanParams: [
        { name: "overlay", default: false }
      ],
      colorParams: [
        { name: "overlayColor", default: "rgba(0, 0, 0,.5)" }
      ]
    },
    
    // 3. TEXTURE BACKGROUND
    {
      name: "Texture Background",
      generate: (params) => {
        const { 
          className,
          textureData,
          lightColor = '#ffffff',
          darkColor = '#000000',
          scale = 1,
          rotation = 0,
          opacity = 100
        } = params;
        
        return `
    .${className} {
      background-image: url('${textureData}');
      background-repeat: repeat;
      background-size: ${scale * 100}px;
      background-color: ${lightColor};
      opacity: ${opacity / 100};
      ${rotation !== 0 ? `transform: rotate(${rotation}deg);` : ''}
      position: relative;
    }
    
    .${className}::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: ${darkColor};
      mask-image: url('${textureData}');
      mask-repeat: repeat;
      mask-size: ${scale * 100}px;
      ${rotation !== 0 ? `transform: rotate(${rotation}deg);` : ''}
      opacity: 0.15;
      z-index: 1;
    }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      textParams: [
        { name: "textureData", default: "data:image/svg+xml;base64,..." }
      ],
      colorParams: [
        { name: "lightColor", default: "#ffffff" },
        { name: "darkColor", default: "#000000" }
      ],
      numericParams: [
        { name: "scale", min: 0.1, max: 5, default: 1, unit: "" },
        { name: "rotation", min: 0, max: 360, default: 0, unit: "deg" },
        { name: "opacity", min: 10, max: 100, default: 100, unit: "%" }
      ]
    },
    
    // 4. GRADIENT BACKGROUND
    {
      name: "Gradient Background",
      generate: (params) => {
        const { 
          className,
          type = 'linear',
          direction = '135deg',
          colors = [
            { color: '#ff7e5f', position: 0 },
            { color: '#feb47b', position: 100 }
          ]
        } = params;
        
        // Sort colors by position
        const sortedColors = [...colors].sort((a, b) => a.position - b.position);
        
        // Generate color stops
        const colorStops = sortedColors.map(
          c => `${c.color} ${c.position}%`
        ).join(', ');
        
        let gradientString = '';
        if (type === 'linear') {
          gradientString = `linear-gradient(${direction}, ${colorStops})`;
        } else if (type === 'radial') {
          gradientString = `radial-gradient(circle, ${colorStops})`;
        } else if (type === 'conic') {
          gradientString = `conic-gradient(from ${direction}, ${colorStops})`;
        }
        
        return `
    .${className} {
      background: ${gradientString};
    }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      selectParams: [
        { 
          name: "type", 
          options: ['linear', 'radial', 'conic'],
          default: 'linear'
        },
        {
          name: "direction",
          options: ['0deg', '45deg', '90deg', '135deg', '180deg', '225deg', '270deg', '315deg'],
          default: '135deg'
        }
      ],
      complexParams: [
        {
          name: "colors",
          type: "colorStops",
          default: [
            { color: '#ff7e5f', position: 0 },
            { color: '#feb47b', position: 100 }
          ],
          max: 4
        }
      ]
    },
    
    // CSS PATTERNS
    
    // 5. Stripes Pattern
    {
      name: "Stripes Pattern",
      generate: (params) => {
        const { 
          className,
          foregroundColor = '#e0e0e0',
          backgroundColor = '#ffffff',
          stripeWidth = 10,
          stripeSpacing = 10,
          angle = 45
        } = params;
        
        return `
    .${className} {
      background-color: ${backgroundColor};
      background-image: linear-gradient(${angle}deg, ${foregroundColor} 25%, transparent 25%, transparent 50%, ${foregroundColor} 50%, ${foregroundColor} 75%, transparent 75%, transparent);
      background-size: ${stripeWidth + stripeSpacing}px ${stripeWidth + stripeSpacing}px;
    }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      colorParams: [
        { name: "foregroundColor", default: "#e0e0e0" },
        { name: "backgroundColor", default: "#ffffff" }
      ],
      numericParams: [
        { name: "stripeWidth", min: 1, max: 50, default: 10, unit: "px" },
        { name: "stripeSpacing", min: 1, max: 50, default: 10, unit: "px" },
        { name: "angle", min: 0, max: 360, default: 45, unit: "deg" }
      ]
    },
    
    // 6. Polka Dots Pattern
    {
      name: "Polka Dots Pattern",
      generate: (params) => {
        const { 
          className,
          foregroundColor = '#e0e0e0',
          backgroundColor = '#ffffff',
          dotSize = 5,
          spacing = 20
        } = params;
        
        return `
    .${className} {
      background-color: ${backgroundColor};
      background-image: radial-gradient(${foregroundColor} ${dotSize}px, transparent ${dotSize}px);
      background-size: ${spacing}px ${spacing}px;
      background-position: 0 0, ${spacing/2}px ${spacing/2}px;
    }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      colorParams: [
        { name: "foregroundColor", default: "#e0e0e0" },
        { name: "backgroundColor", default: "#ffffff" }
      ],
      numericParams: [
        { name: "dotSize", min: 1, max: 20, default: 5, unit: "px" },
        { name: "spacing", min: 10, max: 100, default: 20, unit: "px" }
      ]
    },
    
    // 7. Checkerboard Pattern
    {
      name: "Checkerboard Pattern",
      generate: (params) => {
        const { 
          className,
          foregroundColor = '#e0e0e0',
          backgroundColor = '#ffffff',
          size = 20
        } = params;
        
        return `
    .${className} {
      background-color: ${backgroundColor};
      background-image: 
        linear-gradient(45deg, ${foregroundColor} 25%, transparent 25%), 
        linear-gradient(-45deg, ${foregroundColor} 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, ${foregroundColor} 75%),
        linear-gradient(-45deg, transparent 75%, ${foregroundColor} 75%);
      background-size: ${size*2}px ${size*2}px;
      background-position: 0 0, 0 ${size}px, ${size}px -${size}px, -${size}px 0px;
    }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      colorParams: [
        { name: "foregroundColor", default: "#e0e0e0" },
        { name: "backgroundColor", default: "#ffffff" }
      ],
      numericParams: [
        { name: "size", min: 5, max: 100, default: 20, unit: "px" }
      ]
    },
    
    // 8. Zigzag Pattern
    {
      name: "Zigzag Pattern",
      generate: (params) => {
        const { 
          className,
          foregroundColor = '#e0e0e0',
          backgroundColor = '#ffffff',
          size = 20
        } = params;
        
        return `
    .${className} {
      background-color: ${backgroundColor};
      background-image: 
        linear-gradient(135deg, ${foregroundColor} 25%, transparent 25%) 0 0,
        linear-gradient(225deg, ${foregroundColor} 25%, transparent 25%) 0 0,
        linear-gradient(315deg, ${foregroundColor} 25%, transparent 25%) 0 0,
        linear-gradient(45deg, ${foregroundColor} 25%, transparent 25%) 0 0;
      background-size: ${size*2}px ${size*2}px;
      background-position: 0 0, ${size}px 0, ${size}px -${size}px, 0px ${size}px;
    }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      colorParams: [
        { name: "foregroundColor", default: "#e0e0e0" },
        { name: "backgroundColor", default: "#ffffff" }
      ],
      numericParams: [
        { name: "size", min: 5, max: 100, default: 20, unit: "px" }
      ]
    },
    
// 9. Polka Dot Pattern
{
  name: "Polka Dot Pattern",
  generate: (params) => {
    const {
      className,
      foregroundColor = '#e0e0e0',
      backgroundColor = '#ffffff',
      size = 10,
      spacing = 40
    } = params;

    return `
.${className} {
  background-color: ${backgroundColor};
  background-image:
    radial-gradient(${foregroundColor} ${size}px, transparent ${size}px),
    radial-gradient(${foregroundColor} ${size}px, transparent ${size}px) ${spacing/2}px ${spacing/2}px;
  background-size: ${spacing}px ${spacing}px;
}`;
  },
  html: (className) => `<div class="${className}"></div>`,
  colorParams: [
    { name: "foregroundColor", default: "#e0e0e0" },
    { name: "backgroundColor", default: "#ffffff" }
  ],
  numericParams: [
    { name: "size", min: 2, max: 50, default: 10, unit: "px" },
    { name: "spacing", min: 10, max: 200, default: 40, unit: "px" }
  ]
},

// 10. Diagonal Stripes Pattern
{
  name: "Diagonal Stripes Pattern",
  generate: (params) => {
    const {
      className,
      foregroundColor = '#e0e0e0',
      backgroundColor = '#ffffff',
      size = 20
    } = params;

    return `
.${className} {
  background-color: ${backgroundColor};
  background-image: repeating-linear-gradient(
    45deg,
    ${foregroundColor} 0,
    ${foregroundColor} ${size}px,
    transparent ${size}px,
    transparent ${size * 2}px
  );
}`;
  },
  html: (className) => `<div class="${className}"></div>`,
  colorParams: [
    { name: "foregroundColor", default: "#e0e0e0" },
    { name: "backgroundColor", default: "#ffffff" }
  ],
  numericParams: [
    { name: "size", min: 5, max: 100, default: 20, unit: "px" }
  ]
},

// 11. Concentric Circles Pattern
{
  name: "Concentric Circles Pattern",
  generate: (params) => {
    const {
      className,
      foregroundColor = '#e0e0e0',
      backgroundColor = '#ffffff',
      size = 10
    } = params;

    return `
.${className} {
  background-color: ${backgroundColor};
  background-image: radial-gradient(
    circle,
    ${foregroundColor} ${size}px,
    transparent ${size}px,
    ${foregroundColor} ${size * 2}px,
    transparent ${size * 2}px
  );
  background-size: ${size * 4}px ${size * 4}px;
}`;
  },
  html: (className) => `<div class="${className}"></div>`,
  colorParams: [
    { name: "foregroundColor", default: "#e0e0e0" },
    { name: "backgroundColor", default: "#ffffff" }
  ],
  numericParams: [
    { name: "size", min: 5, max: 100, default: 10, unit: "px" }
  ]
},

// 12. Crosshatch Pattern
{
  name: "Crosshatch Pattern",
  generate: (params) => {
    const {
      className,
      foregroundColor = '#e0e0e0',
      backgroundColor = '#ffffff',
      size = 10,
      thickness = 1
    } = params;

    return `
.${className} {
  background-color: ${backgroundColor};
  background-image:
    repeating-linear-gradient(
      0deg,
      ${foregroundColor} 0,
      ${foregroundColor} ${thickness}px,
      transparent ${thickness}px,
      transparent ${size}px
    ),
    repeating-linear-gradient(
      90deg,
      ${foregroundColor} 0,
      ${foregroundColor} ${thickness}px,
      transparent ${thickness}px,
      transparent ${size}px
    );
  background-size: ${size}px ${size}px;
}`;
  },
  html: (className) => `<div class="${className}"></div>`,
  colorParams: [
    { name: "foregroundColor", default: "#e0e0e0" },
    { name: "backgroundColor", default: "#ffffff" }
  ],
  numericParams: [
    { name: "size", min: 5, max: 100, default: 10, unit: "px" },
    { name: "thickness", min: 1, max: 10, default: 1, unit: "px" }
  ]
},

// 13. Wave Pattern
{
  name: "Wave Pattern",
  generate: (params) => {
    const {
      className,
      foregroundColor = '#e0e0e0',
      backgroundColor = '#ffffff',
      size = 20
    } = params;

    return `
.${className} {
  background-color: ${backgroundColor};
  background-image:
    radial-gradient(circle at 50% 0, ${foregroundColor} ${size}px, transparent ${size}px),
    radial-gradient(circle at 50% 100%, ${foregroundColor} ${size}px, transparent ${size}px);
  background-size: ${size * 2}px ${size * 2}px;
}`;
  },
  html: (className) => `<div class="${className}"></div>`,
  colorParams: [
    { name: "foregroundColor", default: "#e0e0e0" },
    { name: "backgroundColor", default: "#ffffff" }
  ],
  numericParams: [
    { name: "size", min: 5, max: 100, default: 20, unit: "px" }
  ]
},





    // SVG BACKGROUNDS
    
    // 9. Wavy Lines SVG
    {
      name: "Wavy Lines SVG",
      generate: (params) => {
        const { 
          className,
          foregroundColor = '#e0e0e0',
          backgroundColor = '#ffffff',
          waveHeight = 20,
          waveWidth = 40,
          opacity = 0.5
        } = params;
        
        const encodedSVG = encodeURIComponent(`<svg width="${waveWidth}" height="${waveHeight}" viewBox="0 0 ${waveWidth} ${waveHeight}" xmlns="http://www.w3.org/2000/svg"><path fill="${foregroundColor}" d="M0 ${waveHeight/2} c ${waveWidth/4} -${waveHeight/2}, ${waveWidth*3/4} -${waveHeight/2}, ${waveWidth} 0 V ${waveHeight} H 0z" fill-opacity="${opacity}"/></svg>`);
        
        return `
    .${className} {
      background-color: ${backgroundColor};
      background-image: url("data:image/svg+xml,${encodedSVG}");
      background-size: ${waveWidth}px ${waveHeight}px;
    }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      colorParams: [
        { name: "foregroundColor", default: "#e0e0e0" },
        { name: "backgroundColor", default: "#ffffff" }
      ],
      numericParams: [
        { name: "waveHeight", min: 5, max: 100, default: 20, unit: "px" },
        { name: "waveWidth", min: 10, max: 200, default: 40, unit: "px" },
        { name: "opacity", min: 0.1, max: 1, default: 0.5, unit: "" }
      ]
    },
    
    // 10. Grid SVG
    {
      name: "Grid SVG",
      generate: (params) => {
        const { 
          className,
          lineColor = '#e0e0e0',
          backgroundColor = '#ffffff',
          gridSize = 20,
          lineWidth = 1
        } = params;
        
        const encodedSVG = encodeURIComponent(`<svg width="${gridSize}" height="${gridSize}" xmlns="http://www.w3.org/2000/svg"><rect width="${gridSize}" height="${gridSize}" fill="${backgroundColor}"/><path d="M ${gridSize} 0 L 0 0 0 ${gridSize}" fill="none" stroke="${lineColor}" stroke-width="${lineWidth}"/></svg>`);
        
        return `
    .${className} {
      background-image: url("data:image/svg+xml,${encodedSVG}");
      background-size: ${gridSize}px ${gridSize}px;
    }`;
      },
      html: (className) => `<div class="${className}"></div>`,
      colorParams: [
        { name: "lineColor", default: "#e0e0e0" },
        { name: "backgroundColor", default: "#ffffff" }
      ],
      numericParams: [
        { name: "gridSize", min: 10, max: 100, default: 20, unit: "px" },
        { name: "lineWidth", min: 0.5, max: 5, default: 1, unit: "px" }
      ]
    }
  ];
  
  export default BACKGROUND_STYLES;