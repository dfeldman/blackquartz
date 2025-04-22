/**
 * SECTION_BREAKS - A collection of CSS section break styles
 * 
 * Each section break object contains:
 * - name: Display name of the section break style
 * - generate: Function to generate CSS, takes parameters object
 * - html: Optional function to generate the HTML structure needed (if any)
 * - numericParams: Array of numeric parameters with min/max values
 * - colorParams: Array of color parameters
 * 
 * Use in stylesheet generation and UI controls
 */

const SECTION_BREAKS = [
    // 1. Solid
    {
      name: "Solid",
      generate: (params) => {
        const { className, width, height, marginTop, marginBottom, alignment, primaryColor } = params;
        const alignmentStyle = alignment === 'left' ? 'margin-right: auto; margin-left: 0;' :
                              alignment === 'right' ? 'margin-right: 0; margin-left: auto;' :
                              'margin-left: auto; margin-right: auto;';
        
        return `
.${className} {
  width: ${width}%;
  height: ${height}px;
  background-color: ${primaryColor};
  margin-top: ${marginTop}px;
  margin-bottom: ${marginBottom}px;
  ${alignmentStyle}
}`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 10, max: 100, default: 80, unit: "%" },
        { name: "height", min: 1, max: 20, default: 3, unit: "px" },
        { name: "marginTop", min: 0, max: 80, default: 30, unit: "px" },
        { name: "marginBottom", min: 0, max: 80, default: 30, unit: "px" }
      ],
      colorParams: [
        { name: "primaryColor", default: "#333333" }
      ]
    },
    
    // 2. Double
    {
      name: "Double",
      generate: (params) => {
        const { className, width, height, marginTop, marginBottom, alignment, primaryColor } = params;
        const alignmentStyle = alignment === 'left' ? 'margin-right: auto; margin-left: 0;' :
                              alignment === 'right' ? 'margin-right: 0; margin-left: auto;' :
                              'margin-left: auto; margin-right: auto;';
        
        return `
.${className} {
  width: ${width}%;
  height: ${height * 3}px;
  border-top: ${Math.max(1, Math.floor(height / 2))}px solid ${primaryColor};
  border-bottom: ${Math.max(1, Math.floor(height / 2))}px solid ${primaryColor};
  background-color: transparent;
  box-sizing: border-box;
  margin-top: ${marginTop}px;
  margin-bottom: ${marginBottom}px;
  ${alignmentStyle}
}`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 10, max: 100, default: 80, unit: "%" },
        { name: "height", min: 1, max: 10, default: 2, unit: "px" },
        { name: "marginTop", min: 0, max: 80, default: 30, unit: "px" },
        { name: "marginBottom", min: 0, max: 80, default: 30, unit: "px" }
      ],
      colorParams: [
        { name: "primaryColor", default: "#333333" }
      ]
    },
    
    // 3. Dashed
    {
      name: "Dashed",
      generate: (params) => {
        const { className, width, height, dashLength, marginTop, marginBottom, alignment, primaryColor } = params;
        const alignmentStyle = alignment === 'left' ? 'margin-right: auto; margin-left: 0;' :
                              alignment === 'right' ? 'margin-right: 0; margin-left: auto;' :
                              'margin-left: auto; margin-right: auto;';
        
        return `
.${className} {
  width: ${width}%;
  height: ${height}px;
  background-color: transparent;
  background-image: linear-gradient(to right, ${primaryColor} 50%, transparent 50%);
  background-size: ${dashLength}px ${height}px;
  background-repeat: repeat-x;
  margin-top: ${marginTop}px;
  margin-bottom: ${marginBottom}px;
  ${alignmentStyle}
}`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 10, max: 100, default: 80, unit: "%" },
        { name: "height", min: 1, max: 10, default: 3, unit: "px" },
        { name: "dashLength", min: 5, max: 50, default: 20, unit: "px" },
        { name: "marginTop", min: 0, max: 80, default: 30, unit: "px" },
        { name: "marginBottom", min: 0, max: 80, default: 30, unit: "px" }
      ],
      colorParams: [
        { name: "primaryColor", default: "#333333" }
      ]
    },
    
    // 4. Dotted
    {
      name: "Dotted",
      generate: (params) => {
        const { className, width, height, dotSpacing, marginTop, marginBottom, alignment, primaryColor } = params;
        const alignmentStyle = alignment === 'left' ? 'margin-right: auto; margin-left: 0;' :
                              alignment === 'right' ? 'margin-right: 0; margin-left: auto;' :
                              'margin-left: auto; margin-right: auto;';
        const dotSize = Math.max(height, 2);
        
        return `
.${className} {
  width: ${width}%;
  height: ${dotSize}px;
  background-color: transparent;
  background-image: radial-gradient(circle, ${primaryColor} 40%, transparent 40%);
  background-size: ${dotSpacing}px ${dotSize}px;
  background-position: center;
  background-repeat: repeat-x;
  margin-top: ${marginTop}px;
  margin-bottom: ${marginBottom}px;
  ${alignmentStyle}
}`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 10, max: 100, default: 80, unit: "%" },
        { name: "height", min: 1, max: 10, default: 4, unit: "px" },
        { name: "dotSpacing", min: 5, max: 30, default: 10, unit: "px" },
        { name: "marginTop", min: 0, max: 80, default: 30, unit: "px" },
        { name: "marginBottom", min: 0, max: 80, default: 30, unit: "px" }
      ],
      colorParams: [
        { name: "primaryColor", default: "#333333" }
      ]
    },
    
    // 5. Gradient
    {
      name: "Gradient",
      generate: (params) => {
        const { className, width, height, marginTop, marginBottom, alignment, primaryColor } = params;
        const alignmentStyle = alignment === 'left' ? 'margin-right: auto; margin-left: 0;' :
                              alignment === 'right' ? 'margin-right: 0; margin-left: auto;' :
                              'margin-left: auto; margin-right: auto;';
        
        return `
.${className} {
  width: ${width}%;
  height: ${height}px;
  border-radius: ${Math.ceil(height/2)}px;
  background-image: linear-gradient(to right, transparent 0%, ${primaryColor} 50%, transparent 100%);
  margin-top: ${marginTop}px;
  margin-bottom: ${marginBottom}px;
  ${alignmentStyle}
}`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 10, max: 100, default: 80, unit: "%" },
        { name: "height", min: 1, max: 10, default: 6, unit: "px" },
        { name: "marginTop", min: 0, max: 80, default: 30, unit: "px" },
        { name: "marginBottom", min: 0, max: 80, default: 30, unit: "px" }
      ],
      colorParams: [
        { name: "primaryColor", default: "#333333" }
      ]
    },
    
    // 6. Shadow
    {
      name: "Shadow",
      generate: (params) => {
        const { className, width, height, shadowSize, marginTop, marginBottom, alignment, primaryColor, shadowColor } = params;
        const alignmentStyle = alignment === 'left' ? 'margin-right: auto; margin-left: 0;' :
                              alignment === 'right' ? 'margin-right: 0; margin-left: auto;' :
                              'margin-left: auto; margin-right: auto;';
        
        return `
.${className} {
  width: ${width}%;
  height: ${height}px;
  background-color: ${primaryColor};
  box-shadow: 0 ${shadowSize}px ${shadowSize * 2}px ${shadowColor};
  margin-top: ${marginTop}px;
  margin-bottom: ${marginBottom}px;
  ${alignmentStyle}
}`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 10, max: 100, default: 80, unit: "%" },
        { name: "height", min: 1, max: 10, default: 3, unit: "px" },
        { name: "shadowSize", min: 1, max: 20, default: 4, unit: "px" },
        { name: "marginTop", min: 0, max: 80, default: 30, unit: "px" },
        { name: "marginBottom", min: 0, max: 80, default: 30, unit: "px" }
      ],
      colorParams: [
        { name: "primaryColor", default: "#333333" },
        { name: "shadowColor", default: "rgba(0, 0, 0, 0.3)" }
      ]
    },
    
    // 7. Hand-drawn
    {
      name: "Hand-drawn",
      generate: (params) => {
        const { className, width, height, marginTop, marginBottom, alignment, primaryColor, secondaryColor } = params;
        const alignmentStyle = alignment === 'left' ? 'margin-right: auto; margin-left: 0;' :
                              alignment === 'right' ? 'margin-right: 0; margin-left: auto;' :
                              'margin-left: auto; margin-right: auto;';
        
        return `
.${className} {
  width: ${width}%;
  height: ${height * 3}px;
  position: relative;
  background-color: transparent;
  margin-top: ${marginTop}px;
  margin-bottom: ${marginBottom}px;
  ${alignmentStyle}
}
.${className}::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: ${height}px;
  background-color: ${primaryColor};
  border-radius: ${height}px;
  transform: rotate(-0.3deg);
}
.${className}::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 5%;
  right: 10%;
  height: ${Math.max(1, height - 1)}px;
  background-color: ${secondaryColor || primaryColor};
  border-radius: ${Math.max(1, height - 1)}px;
  opacity: 0.5;
  transform: rotate(0.6deg);
}`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 10, max: 100, default: 80, unit: "%" },
        { name: "height", min: 1, max: 10, default: 3, unit: "px" },
        { name: "marginTop", min: 0, max: 80, default: 30, unit: "px" },
        { name: "marginBottom", min: 0, max: 80, default: 30, unit: "px" }
      ],
      colorParams: [
        { name: "primaryColor", default: "#333333" },
        { name: "secondaryColor", default: "#333333" }
      ]
    },
    
    // 8. Symbol
    {
      name: "Symbol",
      generate: (params) => {
        const { className, width, height, marginTop, marginBottom, alignment, primaryColor, symbol } = params;
        const alignmentStyle = alignment === 'left' ? 'margin-right: auto; margin-left: 0;' :
                              alignment === 'right' ? 'margin-right: 0; margin-left: auto;' :
                              'margin-left: auto; margin-right: auto;';
        
        return `
.${className} {
  width: ${width}%;
  height: ${Math.max(15, height * 5)}px;
  position: relative;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: ${marginTop}px;
  margin-bottom: ${marginBottom}px;
  ${alignmentStyle}
}
.${className}::before,
.${className}::after {
  content: "";
  position: absolute;
  top: 50%;
  height: ${height}px;
  background-color: ${primaryColor};
  width: calc(50% - 30px);
  transform: translateY(-50%);
}
.${className}::before {
  left: 0;
}
.${className}::after {
  right: 0;
}
.${className} .symbol {
  position: relative;
  font-size: ${Math.max(14, height * 5)}px;
  color: ${primaryColor};
  z-index: 1;
  margin: 0 10px;
  background-color: white;
  padding: 0 10px;
}`;
      },
      html: (className, params) => {
        const symbol = params?.symbol || '❧';
        return `<div class="${className}"><span class="symbol">${symbol}</span></div>`;
      },
      numericParams: [
        { name: "width", min: 10, max: 100, default: 80, unit: "%" },
        { name: "height", min: 1, max: 10, default: 3, unit: "px" },
        { name: "marginTop", min: 0, max: 80, default: 30, unit: "px" },
        { name: "marginBottom", min: 0, max: 80, default: 30, unit: "px" }
      ],
      colorParams: [
        { name: "primaryColor", default: "#333333" }
      ],
      otherParams: [
        { name: "symbol", default: "❧", type: "text" }
      ]
    },
    
    // 9. Stars
    {
      name: "Stars",
      generate: (params) => {
        const { className, width, height, symbolCount, marginTop, marginBottom, alignment, primaryColor } = params;
        const alignmentStyle = alignment === 'left' ? 'margin-right: auto; margin-left: 0;' :
                              alignment === 'right' ? 'margin-right: 0; margin-left: auto;' :
                              'margin-left: auto; margin-right: auto;';
        
        return `
.${className} {
  width: ${width}%;
  height: ${Math.max(15, height * 5)}px;
  position: relative;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: ${marginTop}px;
  margin-bottom: ${marginBottom}px;
  ${alignmentStyle}
}
.${className}::before,
.${className}::after {
  content: "";
  position: absolute;
  top: 50%;
  height: ${height}px;
  background-color: ${primaryColor};
  width: calc(50% - ${30 + symbolCount * 10}px);
  transform: translateY(-50%);
}
.${className}::before {
  left: 0;
}
.${className}::after {
  right: 0;
}
.${className} .stars {
  position: relative;
  font-size: ${Math.max(14, height * 5)}px;
  color: ${primaryColor};
  z-index: 1;
  margin: 0 15px;
  letter-spacing: 10px;
  background-color: white;
  padding: 0 15px;
}`;
      },
      html: (className, params) => {
        const count = params?.symbolCount || 3;
        const stars = '★'.repeat(count);
        return `<div class="${className}"><span class="stars">${stars}</span></div>`;
      },
      numericParams: [
        { name: "width", min: 10, max: 100, default: 80, unit: "%" },
        { name: "height", min: 1, max: 10, default: 3, unit: "px" },
        { name: "symbolCount", min: 1, max: 9, default: 3, unit: "" },
        { name: "marginTop", min: 0, max: 80, default: 30, unit: "px" },
        { name: "marginBottom", min: 0, max: 80, default: 30, unit: "px" }
      ],
      colorParams: [
        { name: "primaryColor", default: "#333333" }
      ]
    },
    
    // 10. Wave
    {
      name: "Wave",
      generate: (params) => {
        const { className, width, height, marginTop, marginBottom, alignment, primaryColor } = params;
        const alignmentStyle = alignment === 'left' ? 'margin-right: auto; margin-left: 0;' :
                              alignment === 'right' ? 'margin-right: 0; margin-left: auto;' :
                              'margin-left: auto; margin-right: auto;';
        
        // SVG wave pattern
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 60" preserveAspectRatio="none"><path d="M0,0 C150,40 350,0 500,30 C650,60 700,0 850,30 C1000,60 1100,20 1200,0 L1200,60 L0,60 Z" fill="${primaryColor}"/></svg>`;
        
        // URL encode the SVG for use in CSS
        const encodedSvg = encodeURIComponent(svgString)
          .replace(/'/g, '%27')
          .replace(/"/g, '%22');
        
        return `
.${className} {
  width: ${width}%;
  height: ${Math.max(10, height * 5)}px;
  background-image: url("data:image/svg+xml,${encodedSvg}");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  margin-top: ${marginTop}px;
  margin-bottom: ${marginBottom}px;
  ${alignmentStyle}
}`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 10, max: 100, default: 80, unit: "%" },
        { name: "height", min: 2, max: 20, default: 6, unit: "px" },
        { name: "marginTop", min: 0, max: 80, default: 30, unit: "px" },
        { name: "marginBottom", min: 0, max: 80, default: 30, unit: "px" }
      ],
      colorParams: [
        { name: "primaryColor", default: "#333333" }
      ]
    },
    
    // 11. Brush Stroke
    {
      name: "Brush Stroke",
      generate: (params) => {
        const { className, width, height, dashLength, marginTop, marginBottom, alignment, primaryColor } = params;
        const alignmentStyle = alignment === 'left' ? 'margin-right: auto; margin-left: 0;' :
                              alignment === 'right' ? 'margin-right: 0; margin-left: auto;' :
                              'margin-left: auto; margin-right: auto;';
        
        // SVG brush stroke pattern
        const strokeWidth = Math.max(3, height);
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 60" preserveAspectRatio="none"><path d="M0,30 Q300,60 600,20 T1200,30" stroke="${primaryColor}" stroke-width="${strokeWidth}" fill="none" stroke-linecap="round" stroke-dasharray="${dashLength},${dashLength * 2}" /></svg>`;
        
        // URL encode the SVG for use in CSS
        const encodedSvg = encodeURIComponent(svgString)
          .replace(/'/g, '%27')
          .replace(/"/g, '%22');
        
        return `
.${className} {
  width: ${width}%;
  height: ${Math.max(10, height * 5)}px;
  background-image: url("data:image/svg+xml,${encodedSvg}");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  margin-top: ${marginTop}px;
  margin-bottom: ${marginBottom}px;
  ${alignmentStyle}
}`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 10, max: 100, default: 80, unit: "%" },
        { name: "height", min: 1, max: 10, default: 5, unit: "px" },
        { name: "dashLength", min: 5, max: 50, default: 10, unit: "px" },
        { name: "marginTop", min: 0, max: 80, default: 30, unit: "px" },
        { name: "marginBottom", min: 0, max: 80, default: 30, unit: "px" }
      ],
      colorParams: [
        { name: "primaryColor", default: "#333333" }
      ]
    },
    
    // 12. Flourish
    {
      name: "Flourish",
      generate: (params) => {
        const { className, width, height, marginTop, marginBottom, alignment, primaryColor } = params;
        const alignmentStyle = alignment === 'left' ? 'margin-right: auto; margin-left: 0;' :
                              alignment === 'right' ? 'margin-right: 0; margin-left: auto;' :
                              'margin-left: auto; margin-right: auto;';
        
        // SVG flourish pattern
        const strokeWidth = Math.max(2, height);
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 60"><path d="M0,30 L540,30" stroke="${primaryColor}" stroke-width="${strokeWidth}" /><path d="M660,30 L1200,30" stroke="${primaryColor}" stroke-width="${strokeWidth}" /><path d="M560,10 C580,0 620,0 640,10 C620,20 580,20 560,10 Z" fill="${primaryColor}" /><path d="M540,30 C520,40 520,20 540,20 C560,20 560,40 540,30 Z" fill="${primaryColor}" /><path d="M660,30 C640,40 640,20 660,20 C680,20 680,40 660,30 Z" fill="${primaryColor}" /></svg>`;
        
        // URL encode the SVG for use in CSS
        const encodedSvg = encodeURIComponent(svgString)
          .replace(/'/g, '%27')
          .replace(/"/g, '%22');
        
        return `
.${className} {
  width: ${width}%;
  height: ${Math.max(15, height * 5)}px;
  background-image: url("data:image/svg+xml,${encodedSvg}");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  margin-top: ${marginTop}px;
  margin-bottom: ${marginBottom}px;
  ${alignmentStyle}
}`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 10, max: 100, default: 80, unit: "%" },
        { name: "height", min: 2, max: 10, default: 4, unit: "px" },
        { name: "marginTop", min: 0, max: 80, default: 30, unit: "px" },
        { name: "marginBottom", min: 0, max: 80, default: 30, unit: "px" }
      ],
      colorParams: [
        { name: "primaryColor", default: "#333333" }
      ]
    },
    
    // 13. Hearts
    {
      name: "Hearts",
      generate: (params) => {
        const { className, width, height, marginTop, marginBottom, alignment, primaryColor } = params;
        const alignmentStyle = alignment === 'left' ? 'margin-right: auto; margin-left: 0;' :
                              alignment === 'right' ? 'margin-right: 0; margin-left: auto;' :
                              'margin-left: auto; margin-right: auto;';
        
        // SVG hearts pattern
        const strokeWidth = Math.max(2, height);
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 60"><path d="M0,30 L390,30" stroke="${primaryColor}" stroke-width="${strokeWidth}" /><path d="M810,30 L1200,30" stroke="${primaryColor}" stroke-width="${strokeWidth}" /><path d="M600,45 C550,0 450,0 420,20 C390,40 450,60 600,20 C750,60 810,40 780,20 C750,0 650,0 600,45 Z" fill="${primaryColor}" /></svg>`;
        
        // URL encode the SVG for use in CSS
        const encodedSvg = encodeURIComponent(svgString)
          .replace(/'/g, '%27')
          .replace(/"/g, '%22');
        
        return `
.${className} {
  width: ${width}%;
  height: ${Math.max(15, height * 5)}px;
  background-image: url("data:image/svg+xml,${encodedSvg}");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  margin-top: ${marginTop}px;
  margin-bottom: ${marginBottom}px;
  ${alignmentStyle}
}`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 10, max: 100, default: 80, unit: "%" },
        { name: "height", min: 2, max: 10, default: 4, unit: "px" },
        { name: "marginTop", min: 0, max: 80, default: 30, unit: "px" },
        { name: "marginBottom", min: 0, max: 80, default: 30, unit: "px" }
      ],
      colorParams: [
        { name: "primaryColor", default: "#333333" }
      ]
    },
    
    // 14. Circuit
    {
      name: "Circuit",
      generate: (params) => {
        const { className, width, height, marginTop, marginBottom, alignment, primaryColor } = params;
        const alignmentStyle = alignment === 'left' ? 'margin-right: auto; margin-left: 0;' :
                              alignment === 'right' ? 'margin-right: 0; margin-left: auto;' :
                              'margin-left: auto; margin-right: auto;';
        
        // SVG circuit pattern
        const strokeWidth = Math.max(2, height);
        const circleRadius = Math.max(3, height);
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 60"><path d="M0,30 L200,30 L220,10 L380,10 L400,30 L600,30 L620,50 L780,50 L800,30 L1000,30 L1020,10 L1180,10 L1200,30" stroke="${primaryColor}" stroke-width="${strokeWidth}" fill="none" /><circle cx="200" cy="30" r="${circleRadius}" fill="${primaryColor}" /><circle cx="400" cy="30" r="${circleRadius}" fill="${primaryColor}" /><circle cx="600" cy="30" r="${circleRadius}" fill="${primaryColor}" /><circle cx="800" cy="30" r="${circleRadius}" fill="${primaryColor}" /><circle cx="1000" cy="30" r="${circleRadius}" fill="${primaryColor}" /></svg>`;
        
        // URL encode the SVG for use in CSS
        const encodedSvg = encodeURIComponent(svgString)
          .replace(/'/g, '%27')
          .replace(/"/g, '%22');
        
        return `
.${className} {
  width: ${width}%;
  height: ${Math.max(15, height * 5)}px;
  background-image: url("data:image/svg+xml,${encodedSvg}");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  margin-top: ${marginTop}px;
  margin-bottom: ${marginBottom}px;
  ${alignmentStyle}
}`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 10, max: 100, default: 80, unit: "%" },
        { name: "height", min: 2, max: 10, default: 4, unit: "px" },
        { name: "marginTop", min: 0, max: 80, default: 30, unit: "px" },
        { name: "marginBottom", min: 0, max: 80, default: 30, unit: "px" }
      ],
      colorParams: [
        { name: "primaryColor", default: "#333333" }
      ]
    },
    
    // 15. Tribal
    {
      name: "Tribal",
      generate: (params) => {
        const { className, width, height, marginTop, marginBottom, alignment, primaryColor } = params;
        const alignmentStyle = alignment === 'left' ? 'margin-right: auto; margin-left: 0;' :
                              alignment === 'right' ? 'margin-right: 0; margin-left: auto;' :
                              'margin-left: auto; margin-right: auto;';
        
        // SVG tribal pattern
        const strokeWidth = Math.max(2, height);
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 60"><path d="M0,30 L1200,30" stroke="${primaryColor}" stroke-width="${strokeWidth}" /><path d="M150,15 L150,45 L225,25 L300,45 L300,15" stroke="${primaryColor}" stroke-width="${strokeWidth}" fill="none" /><path d="M450,15 L450,45 L525,25 L600,45 L600,15" stroke="${primaryColor}" stroke-width="${strokeWidth}" fill="none" /><path d="M750,15 L750,45 L825,25 L900,45 L900,15" stroke="${primaryColor}" stroke-width="${strokeWidth}" fill="none" /></svg>`;
        
        // URL encode the SVG for use in CSS
        const encodedSvg = encodeURIComponent(svgString)
          .replace(/'/g, '%27')
          .replace(/"/g, '%22');
        
        return `
.${className} {
  width: ${width}%;
  height: ${Math.max(15, height * 5)}px;
  background-image: url("data:image/svg+xml,${encodedSvg}");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  margin-top: ${marginTop}px;
  margin-bottom: ${marginBottom}px;
  ${alignmentStyle}
}`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 10, max: 100, default: 80, unit: "%" },
        { name: "height", min: 2, max: 10, default: 4, unit: "px" },
        { name: "marginTop", min: 0, max: 80, default: 30, unit: "px" },
        { name: "marginBottom", min: 0, max: 80, default: 30, unit: "px" }
      ],
      colorParams: [
        { name: "primaryColor", default: "#333333" }
      ]
    },
    
    // 16. Curly
    {
      name: "Curly",
      generate: (params) => {
        const { className, width, height, waveDensity, marginTop, marginBottom, alignment, primaryColor } = params;
        const alignmentStyle = alignment === 'left' ? 'margin-right: auto; margin-left: 0;' :
                              alignment === 'right' ? 'margin-right: 0; margin-left: auto;' :
                              'margin-left: auto; margin-right: auto;';
        
        // SVG curly pattern
        const strokeWidth = Math.max(2, height);
        const amplitude = Math.min(30, waveDensity * 2);
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 60"><path d="M0,30 L480,30" stroke="${primaryColor}" stroke-width="${strokeWidth}" /><path d="M720,30 L1200,30" stroke="${primaryColor}" stroke-width="${strokeWidth}" /><path d="M480,30 C520,${30 - amplitude} 560,${30 + amplitude} 600,30 C640,${30 - amplitude} 680,${30 + amplitude} 720,30" stroke="${primaryColor}" stroke-width="${strokeWidth}" fill="none" /></svg>`;
        
        // URL encode the SVG for use in CSS
        const encodedSvg = encodeURIComponent(svgString)
          .replace(/'/g, '%27')
          .replace(/"/g, '%22');
        
        return `
.${className} {
  width: ${width}%;
  height: ${Math.max(15, height * 5)}px;
  background-image: url("data:image/svg+xml,${encodedSvg}");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  margin-top: ${marginTop}px;
  margin-bottom: ${marginBottom}px;
  ${alignmentStyle}
}`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 10, max: 100, default: 80, unit: "%" },
        { name: "height", min: 2, max: 10, default: 4, unit: "px" },
        { name: "waveDensity", min: 3, max: 15, default: 10, unit: "" },
        { name: "marginTop", min: 0, max: 80, default: 30, unit: "px" },
        { name: "marginBottom", min: 0, max: 80, default: 30, unit: "px" }
      ],
      colorParams: [
        { name: "primaryColor", default: "#333333" }
      ]
    },
    
    // 17. Puzzle
    {
      name: "Puzzle",
      generate: (params) => {
        const { className, width, height, marginTop, marginBottom, alignment, primaryColor } = params;
        const alignmentStyle = alignment === 'left' ? 'margin-right: auto; margin-left: 0;' :
                              alignment === 'right' ? 'margin-right: 0; margin-left: auto;' :
                              'margin-left: auto; margin-right: auto;';
        
        // SVG puzzle pattern
        const strokeWidth = Math.max(2, height);
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 60"><path d="M0,30 L480,30 Q495,30 495,15 Q495,0 510,0 Q525,0 525,15 Q525,30 540,30 L660,30 Q675,30 675,15 Q675,0 690,0 Q705,0 705,15 Q705,30 720,30 L1200,30" stroke="${primaryColor}" stroke-width="${strokeWidth}" fill="none" /></svg>`;
        
        // URL encode the SVG for use in CSS
        const encodedSvg = encodeURIComponent(svgString)
          .replace(/'/g, '%27')
          .replace(/"/g, '%22');
        
        return `
.${className} {
  width: ${width}%;
  height: ${Math.max(15, height * 5)}px;
  background-image: url("data:image/svg+xml,${encodedSvg}");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  margin-top: ${marginTop}px;
  margin-bottom: ${marginBottom}px;
  ${alignmentStyle}
}`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 10, max: 100, default: 80, unit: "%" },
        { name: "height", min: 2, max: 10, default: 4, unit: "px" },
        { name: "marginTop", min: 0, max: 80, default: 30, unit: "px" },
        { name: "marginBottom", min: 0, max: 80, default: 30, unit: "px" }
      ],
      colorParams: [
        { name: "primaryColor", default: "#333333" }
      ]
    },
    
    // 18. Leaf
    {
      name: "Leaf",
      generate: (params) => {
        const { className, width, height, marginTop, marginBottom, alignment, primaryColor } = params;
        const alignmentStyle = alignment === 'left' ? 'margin-right: auto; margin-left: 0;' :
                              alignment === 'right' ? 'margin-right: 0; margin-left: auto;' :
                              'margin-left: auto; margin-right: auto;';
        
        // SVG leaf pattern
        const strokeWidth = Math.max(2, height);
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 60"><path d="M0,30 L480,30" stroke="${primaryColor}" stroke-width="${strokeWidth}" /><path d="M720,30 L1200,30" stroke="${primaryColor}" stroke-width="${strokeWidth}" /><path d="M600,10 C570,10 540,50 600,50 C660,50 630,10 600,10 Z" fill="${primaryColor}" /><path d="M600,30 L480,30" stroke="${primaryColor}" stroke-width="1" /><path d="M600,30 L720,30" stroke="${primaryColor}" stroke-width="1" /></svg>`;
        
        // URL encode the SVG for use in CSS
        const encodedSvg = encodeURIComponent(svgString)
          .replace(/'/g, '%27')
          .replace(/"/g, '%22');
        
        return `
.${className} {
  width: ${width}%;
  height: ${Math.max(15, height * 5)}px;
  background-image: url("data:image/svg+xml,${encodedSvg}");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  margin-top: ${marginTop}px;
  margin-bottom: ${marginBottom}px;
  ${alignmentStyle}
}`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 10, max: 100, default: 80, unit: "%" },
        { name: "height", min: 2, max: 10, default: 4, unit: "px" },
        { name: "marginTop", min: 0, max: 80, default: 30, unit: "px" },
        { name: "marginBottom", min: 0, max: 80, default: 30, unit: "px" }
      ],
      colorParams: [
        { name: "primaryColor", default: "#333333" }
      ]
    },
    
    // 19. Snowflake
    {
      name: "Snowflake",
      generate: (params) => {
        const { className, width, height, marginTop, marginBottom, alignment, primaryColor } = params;
        const alignmentStyle = alignment === 'left' ? 'margin-right: auto; margin-left: 0;' :
                              alignment === 'right' ? 'margin-right: 0; margin-left: auto;' :
                              'margin-left: auto; margin-right: auto;';
        
        // SVG snowflake pattern
        const strokeWidth = Math.max(2, height);
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 60"><path d="M0,30 L560,30" stroke="${primaryColor}" stroke-width="${strokeWidth}" /><path d="M640,30 L1200,30" stroke="${primaryColor}" stroke-width="${strokeWidth}" /><path d="M600,10 L600,50" stroke="${primaryColor}" stroke-width="${strokeWidth}" /><path d="M580,15 L620,45" stroke="${primaryColor}" stroke-width="${strokeWidth}" /><path d="M580,45 L620,15" stroke="${primaryColor}" stroke-width="${strokeWidth}" /><path d="M590,20 L590,40" stroke="${primaryColor}" stroke-width="${strokeWidth}" /><path d="M610,20 L610,40" stroke="${primaryColor}" stroke-width="${strokeWidth}" /><path d="M585,25 L615,25" stroke="${primaryColor}" stroke-width="${strokeWidth}" /><path d="M585,35 L615,35" stroke="${primaryColor}" stroke-width="${strokeWidth}" /></svg>`;
        
        // URL encode the SVG for use in CSS
        const encodedSvg = encodeURIComponent(svgString)
          .replace(/'/g, '%27')
          .replace(/"/g, '%22');
        
        return `
.${className} {
  width: ${width}%;
  height: ${Math.max(15, height * 5)}px;
  background-image: url("data:image/svg+xml,${encodedSvg}");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  margin-top: ${marginTop}px;
  margin-bottom: ${marginBottom}px;
  ${alignmentStyle}
}`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 10, max: 100, default: 80, unit: "%" },
        { name: "height", min: 2, max: 10, default: 4, unit: "px" },
        { name: "marginTop", min: 0, max: 80, default: 30, unit: "px" },
        { name: "marginBottom", min: 0, max: 80, default: 30, unit: "px" }
      ],
      colorParams: [
        { name: "primaryColor", default: "#333333" }
      ]
    },
    
    // 20. Interactive
    {
      name: "Interactive",
      generate: (params) => {
        const { className, width, height, marginTop, marginBottom, alignment, primaryColor } = params;
        const alignmentStyle = alignment === 'left' ? 'margin-right: auto; margin-left: 0;' :
                              alignment === 'right' ? 'margin-right: 0; margin-left: auto;' :
                              'margin-left: auto; margin-right: auto;';
        
        // SVG interactive pattern
        const strokeWidth = Math.max(2, height);
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 60"><path d="M0,30 C200,50 400,10 600,30 C800,50 1000,10 1200,30" stroke="${primaryColor}" stroke-width="${strokeWidth}" fill="none" stroke-dasharray="8,4" /><circle cx="600" cy="30" r="5" fill="${primaryColor}" /><circle cx="300" cy="40" r="3" fill="${primaryColor}" /><circle cx="900" cy="40" r="3" fill="${primaryColor}" /></svg>`;
        
        // URL encode the SVG for use in CSS
        const encodedSvg = encodeURIComponent(svgString)
          .replace(/'/g, '%27')
          .replace(/"/g, '%22');
        
        return `
.${className} {
  width: ${width}%;
  height: ${Math.max(15, height * 5)}px;
  background-image: url("data:image/svg+xml,${encodedSvg}");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  margin-top: ${marginTop}px;
  margin-bottom: ${marginBottom}px;
  ${alignmentStyle}
  transition: transform 0.3s ease;
}
.${className}:hover {
  transform: scaleY(1.2);
}`;
      },
      html: (className) => `<div class="${className}"></div>`,
      numericParams: [
        { name: "width", min: 10, max: 100, default: 80, unit: "%" },
        { name: "height", min: 2, max: 10, default: 4, unit: "px" },
        { name: "marginTop", min: 0, max: 80, default: 30, unit: "px" },
        { name: "marginBottom", min: 0, max: 80, default: 30, unit: "px" }
      ],
      colorParams: [
        { name: "primaryColor", default: "#333333" }
      ]
    }
  ];
  
  export default SECTION_BREAKS;
  