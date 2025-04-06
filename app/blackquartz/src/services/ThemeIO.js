import CSSGenerator from './CSSGenerator';

// Theme import/export utilities
const ThemeIO = {
  // Export CSS with theme JSON embedded as comment
  exportCSS(theme, mode = 'light') {
    const themeJSON = JSON.stringify(theme, null, 2);
    const carouselNote = theme.imageLinks?.layout === 'carousel' ?
      `/*
  Carousel Note:
  The carousel uses CSS scroll-snap for smooth scrolling.
  For enhanced user experience, add the minimal JavaScript 
  included in the HTML demo.
*/` : '';
    const jsonComment = `/*
    BlackQuartz 2.0 Theme Settings
    --------------------------
    Copy the JSON below to save your theme or reimport it later:
    
    START_BLACKQUARTZ_THEME
    ${themeJSON}
    END_BLACKQUARTZ_THEME
    --------------------------
    */
    ${carouselNote}
    `;

    // Add the comment to the top of the CSS
    const css = jsonComment + CSSGenerator.generateCSS(theme, mode);

    return css;
  },

  // Export HTML demo
  exportHTML(theme, cssCode, htmlContent) {
    const carouselNote = theme.imageLinks?.layout === 'carousel' ?
      '<!-- Note: The carousel uses minimal JavaScript for navigation. You can remove it for a CSS-only experience with reduced functionality. -->' : '';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BlackQuartz 2.0 Theme Demo</title>
  ${theme.loadedFonts.map(font => `<link href="${font}" rel="stylesheet">`).join('\n')}
  <style>${cssCode}</style>
</head>
<body>
  ${carouselNote}
  ${htmlContent}
</body>
</html>
`;
  }
};

export default ThemeIO;
