// Constants for the application
export const CONSTANTS = {
    // Patterns
    PATTERNS: [
      {
        id: 'solid',
        name: 'Solid',
        colors: 1,
        supportsScale: false,
        supportsAngle: false,
        css: (colors, scale, angle) => {
          return `background-color: ${colors[0]};`;
        }
      },
      {
        id: 'linearGradient',
        name: 'Linear Gradient',
        colors: 2,
        supportsScale: false,
        supportsAngle: true,
        css: (colors, scale, angle) => {
          return `background: linear-gradient(${angle}deg, ${colors[0]}, ${colors[1]});`;
        }
      },
      {
        id: 'polkaDots',
        name: 'Polka Dots',
        colors: 2,
        supportsScale: true,
        supportsAngle: false,
        css: (colors, scale) => {
          return `
            background-color: ${colors[0]};
            background-image: radial-gradient(${colors[1]} ${scale / 6}px, transparent ${scale / 6}px);
            background-size: ${scale}px ${scale}px;
            background-position: 0 0, ${scale / 2}px ${scale / 2}px;
          `;
        }
      },
      {
        id: 'stripes',
        name: 'Stripes',
        colors: 2,
        supportsScale: true,
        supportsAngle: true,
        css: (colors, scale, angle) => {
          return `
            background: repeating-linear-gradient(
              ${angle}deg,
              ${colors[0]},
              ${colors[0]} ${scale / 2}px,
              ${colors[1]} ${scale / 2}px,
              ${colors[1]} ${scale}px
            );
          `;
        }
      },
      {
        id: 'zigzag',
        name: 'Zigzag',
        colors: 2,
        supportsScale: true,
        supportsAngle: false,
        css: (colors, scale) => {
          return `
            background-color: ${colors[0]};
            background-image: 
              linear-gradient(135deg, ${colors[1]} 25%, transparent 25%),
              linear-gradient(225deg, ${colors[1]} 25%, transparent 25%);
            background-size: ${scale}px ${scale}px;
            background-position: 0 0, ${scale / 2}px 0;
          `;
        }
      }
    ],
  
    // Textures
    TEXTURES: [
      {
        id: 'paper',
        name: 'Paper',
        url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjg1IiBudW1PY3RhdmVzPSI1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdmFsdWVzPSIwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAxIDAiLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjYSkiLz48L3N2Zz4='
      }
    ],
  
    // Color Themes
    COLOR_THEMES: [
      {
        name: 'Blues',
        colors: ['#0096FF', '#0074D9', '#004d99', '#001f3d'],
        darks: ['#001f3d', '#004d99', '#0074D9', '#0096FF']
      },
      {
        name: 'Greens',
        colors: ['#2ECC40', '#01FF70', '#1a9930', '#0d4c18'],
        darks: ['#0d4c18', '#1a9930', '#2ECC40', '#01FF70']
      },
      {
        name: 'Reds',
        colors: ['#FF4136', '#FF851B', '#991a1a', '#590b0b'],
        darks: ['#590b0b', '#991a1a', '#FF4136', '#FF851B']
      },
      {
        name: 'Purples',
        colors: ['#B10DC9', '#9900ff', '#660099', '#330033'],
        darks: ['#330033', '#660099', '#9900ff', '#B10DC9']
      },
      {
        name: 'Grays',
        colors: ['#AAAAAA', '#777777', '#444444', '#111111'],
        darks: ['#111111', '#444444', '#777777', '#AAAAAA']
      }
    ],
  
    // Font Pairings
    FONT_PAIRINGS: [
      {
        name: 'Modern Sans',
        description: 'Clean, modern sans-serif combination',
        heading: "'Montserrat', sans-serif",
        body: "'Open Sans', sans-serif"
      },
      {
        name: 'Classic Serif',
        description: 'Timeless serif combination with excellent readability',
        heading: "'Playfair Display', serif",
        body: "'Lora', serif"
      },
      {
        name: 'Contemporary Mix',
        description: 'Sans-serif headings with serif body for contrast',
        heading: "'Raleway', sans-serif",
        body: "'Merriweather', serif"
      },
      {
        name: 'Professional',
        description: 'Clean professional look for corporate sites',
        heading: "'Roboto', sans-serif",
        body: "'Source Sans Pro', sans-serif"
      }
    ],
  
    // Google Fonts
    GOOGLE_FONTS: [
      { family: 'Roboto', category: 'sans-serif' },
      { family: 'Open Sans', category: 'sans-serif' },
      { family: 'Lato', category: 'sans-serif' },
      { family: 'Montserrat', category: 'sans-serif' },
      { family: 'Roboto Condensed', category: 'sans-serif' },
      { family: 'Source Sans Pro', category: 'sans-serif' },
      { family: 'Oswald', category: 'sans-serif' },
      { family: 'Raleway', category: 'sans-serif' },
      { family: 'Ubuntu', category: 'sans-serif' },
      { family: 'Merriweather', category: 'serif' },
      { family: 'PT Sans', category: 'sans-serif' },
      { family: 'Roboto Slab', category: 'serif' },
      { family: 'Playfair Display', category: 'serif' },
      { family: 'Lora', category: 'serif' },
      { family: 'Poppins', category: 'sans-serif' },
      { family: 'Noto Sans', category: 'sans-serif' },
      { family: 'Nunito', category: 'sans-serif' },
      { family: 'Quicksand', category: 'sans-serif' },
      { family: 'Work Sans', category: 'sans-serif' },
      { family: 'Fira Sans', category: 'sans-serif' }
    ]
  };



  
  // Color Themes for the global theme editor
  export const COLOR_THEMES = [
    {
      name: 'Classic Light',
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
    },
    {
      name: 'Blue Sky',
      light: [
        '#333333', // Text color
        '#1A365D', // Heading color
        '#FFFFFF', // Page background color
        '#EBF8FF', // Body background color 1
        '#BEE3F8', // Body background color 2
        '#4299E1', // Highlight background color 1
        '#C4F1F9', // Highlight background color 2
        '#90CDF4', // Large border color
        '#E2E8F0'  // Small border color
      ],
      dark: [
        '#E2E8F0', // Text color
        '#90CDF4', // Heading color
        '#1A202C', // Page background color
        '#2D3748', // Body background color 1
        '#4A5568', // Body background color 2
        '#2B6CB0', // Highlight background color 1
        '#285E61', // Highlight background color 2
        '#2C5282', // Large border color
        '#4A5568'  // Small border color
      ]
    },
    {
      name: 'Forest Green',
      light: [
        '#1A3C34', // Text color
        '#1C4532', // Heading color
        '#FFFFFF', // Page background color
        '#F0FFF4', // Body background color 1
        '#C6F6D5', // Body background color 2
        '#68D391', // Highlight background color 1
        '#9AE6B4', // Highlight background color 2
        '#48BB78', // Large border color
        '#E2E8F0'  // Small border color
      ],
      dark: [
        '#E2E8F0', // Text color
        '#9AE6B4', // Heading color
        '#1A202C', // Page background color
        '#276749', // Body background color 1
        '#22543D', // Body background color 2
        '#48BB78', // Highlight background color 1
        '#9AE6B4', // Highlight background color 2
        '#2F855A', // Large border color
        '#3C685A'  // Small border color
      ]
    },
    {
      name: 'Sunset Orange',
      light: [
        '#2D3748', // Text color
        '#742A2A', // Heading color
        '#FFFFFF', // Page background color
        '#FFFAF0', // Body background color 1
        '#FEEBC8', // Body background color 2
        '#F6AD55', // Highlight background color 1
        '#FC8181', // Highlight background color 2
        '#ED8936', // Large border color
        '#EDF2F7'  // Small border color
      ],
      dark: [
        '#EDF2F7', // Text color
        '#FC8181', // Heading color
        '#1A202C', // Page background color
        '#744210', // Body background color 1
        '#975A16', // Body background color 2
        '#C05621', // Highlight background color 1
        '#9B2C2C', // Highlight background color 2
        '#DD6B20', // Large border color
        '#7B341E'  // Small border color
      ]
    },
    {
      name: 'Purple Haze',
      light: [
        '#322659', // Text color
        '#553C9A', // Heading color
        '#FFFFFF', // Page background color
        '#FAF5FF', // Body background color 1
        '#E9D8FD', // Body background color 2
        '#B794F4', // Highlight background color 1
        '#D6BCFA', // Highlight background color 2
        '#805AD5', // Large border color
        '#E2E8F0'  // Small border color
      ],
      dark: [
        '#E2E8F0', // Text color
        '#D6BCFA', // Heading color
        '#1A202C', // Page background color
        '#4A2B8F', // Body background color 1
        '#44337A', // Body background color 2
        '#6B46C1', // Highlight background color 1
        '#B794F4', // Highlight background color 2
        '#553C9A', // Large border color
        '#322659'  // Small border color
      ]
    },
    {
      name: 'Grayscale',
      light: [
        '#1A202C', // Text color
        '#2D3748', // Heading color
        '#FFFFFF', // Page background color
        '#F7FAFC', // Body background color 1
        '#EDF2F7', // Body background color 2
        '#E2E8F0', // Highlight background color 1
        '#CBD5E0', // Highlight background color 2
        '#A0AEC0', // Large border color
        '#E2E8F0'  // Small border color
      ],
      dark: [
        '#F7FAFC', // Text color
        '#EDF2F7', // Heading color
        '#1A202C', // Page background color
        '#2D3748', // Body background color 1
        '#4A5568', // Body background color 2
        '#718096', // Highlight background color 1
        '#A0AEC0', // Highlight background color 2
        '#718096', // Large border color
        '#4A5568'  // Small border color
      ]
    },
    {
      name: 'Teal Dream',
      light: [
        '#234E52', // Text color
        '#285E61', // Heading color
        '#FFFFFF', // Page background color
        '#E6FFFA', // Body background color 1
        '#B2F5EA', // Body background color 2
        '#4FD1C5', // Highlight background color 1
        '#81E6D9', // Highlight background color 2
        '#38B2AC', // Large border color
        '#E2E8F0'  // Small border color
      ],
      dark: [
        '#E2E8F0', // Text color
        '#81E6D9', // Heading color
        '#1A202C', // Page background color
        '#285E61', // Body background color 1
        '#234E52', // Body background color 2
        '#38B2AC', // Highlight background color 1
        '#81E6D9', // Highlight background color 2
        '#319795', // Large border color
        '#2C7A7B'  // Small border color
      ]
    },
    {
      name: 'Berry Punch',
      light: [
        '#44337A', // Text color
        '#702459', // Heading color
        '#FFFFFF', // Page background color
        '#FFF5F7', // Body background color 1
        '#FED7E2', // Body background color 2
        '#F687B3', // Highlight background color 1
        '#D6BCFA', // Highlight background color 2
        '#D53F8C', // Large border color
        '#E2E8F0'  // Small border color
      ],
      dark: [
        '#E2E8F0', // Text color
        '#FED7E2', // Heading color
        '#1A202C', // Page background color
        '#652B19', // Body background color 1
        '#702459', // Body background color 2
        '#97266D', // Highlight background color 1
        '#6B46C1', // Highlight background color 2
        '#B83280', // Large border color
        '#702459'  // Small border color
      ]
    },
    {
      name: 'Coffee Brown',
      light: [
        '#46373A', // Text color
        '#513C3C', // Heading color
        '#FFFFFF', // Page background color
        '#F8F6F3', // Body background color 1
        '#E8E0D8', // Body background color 2
        '#C7B9AC', // Highlight background color 1
        '#D1B99C', // Highlight background color 2
        '#A89886', // Large border color
        '#EBE5DF'  // Small border color
      ],
      dark: [
        '#F8F6F3', // Text color
        '#E8E0D8', // Heading color
        '#322425', // Page background color
        '#46373A', // Body background color 1
        '#513C3C', // Body background color 2
        '#7D5C52', // Highlight background color 1
        '#8E6F5F', // Highlight background color 2
        '#685044', // Large border color
        '#56433B'  // Small border color
      ]
    },
    {
      name: 'Neon Future',
      light: [
        '#2E3235', // Text color
        '#1A1D21', // Heading color
        '#FFFFFF', // Page background color
        '#F0F5FF', // Body background color 1
        '#E6E6FA', // Body background color 2
        '#4DFFD2', // Highlight background color 1
        '#FF50E5', // Highlight background color 2
        '#7F5AF0', // Large border color
        '#E0E0E0'  // Small border color
      ],
      dark: [
        '#ECF0F5', // Text color
        '#FFFFFF', // Heading color
        '#0F1118', // Page background color
        '#1A1D21', // Body background color 1
        '#2E3235', // Body background color 2
        '#4DFFD2', // Highlight background color 1
        '#FF50E5', // Highlight background color 2
        '#7F5AF0', // Large border color
        '#2A2D30'  // Small border color
      ]
    },
    {
      name: 'Pastel Dream',
      light: [
        '#5B5F63', // Text color
        '#474C50', // Heading color
        '#FFFFFF', // Page background color
        '#FFF8F9', // Body background color 1
        '#FEEEF4', // Body background color 2
        '#FFD6E4', // Highlight background color 1
        '#C5EBFE', // Highlight background color 2
        '#D9EBFF', // Large border color
        '#F0F0F5'  // Small border color
      ],
      dark: [
        '#F0F0F5', // Text color
        '#FEEEF4', // Heading color
        '#2D3033', // Page background color
        '#3D4145', // Body background color 1
        '#474C50', // Body background color 2
        '#825766', // Highlight background color 1
        '#5F7A8C', // Highlight background color 2
        '#697989', // Large border color
        '#525659'  // Small border color
      ]
    },
    {
      name: 'Vintage Paper',
      light: [
        '#4A4238', // Text color
        '#3D362F', // Heading color
        '#FFF8E7', // Page background color
        '#FFF2D8', // Body background color 1
        '#F5E8C9', // Body background color 2
        '#E6C984', // Highlight background color 1
        '#F8D7A3', // Highlight background color 2
        '#D4B26A', // Large border color
        '#EDE0C8'  // Small border color
      ],
      dark: [
        '#F5E8C9', // Text color
        '#FFF2D8', // Heading color
        '#2A2520', // Page background color
        '#3D362F', // Body background color 1
        '#4A4238', // Body background color 2
        '#8C7851', // Highlight background color 1
        '#A28B5E', // Highlight background color 2
        '#7A6844', // Large border color
        '#5C5347'  // Small border color
      ]
    }
  ];