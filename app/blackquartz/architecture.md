# BlackQuartz

BlackQuartz is a CSS theme generator utility. 

Features: 
* Written in modern Vue 3 
* Real-time, live preview
* Exports CSS or its own data model JSON, loads its own JSON
* Huge library of CSS patterns, all fonts from Google Fonts, images for backgrounds
* Support for variable fonts with multiple axes of control
* Preview text with Lorem Ipsum content, any Wikipedia page, or custom content. When set to Lorem Ipsum, there are a variety of options for number of paragraphs, number of images, number of headings, etc.
* Nearly all options are in tear-off panels (InputDetailComponent) so you can have a large number of inputs that would otherwise clutter the screen
* Large library of preset themes
* Light and dark modes: EVERY COLOR has both a light mode component, and a dark mode component. The emitted CSS uses variables so it can switch between light and dark modes depending on the user's system. It should not emit different CSS for light and dark modes, just one CSS that works for both. 
* Theme color references: Rather than a specific color, any color can also be a reference into a global color theme. That way the actual color value can be changed later and apply everywhere. 
* Responsive preview: The default is full-window view, but the interface allows setting the preview to desktop, tablet, or mobile view.
* Mobile mode: While this app is a bit tricky to use on mobile, it does attempt to work on mobile. Editors take up
the full screen as modals on mobile, and the entire editor pane can be hidden to make it easier to preview. 

Structure: 
* We assume a page has ONLY these classes.
 * Body 
 * Header (optional)
 * Footer (optional)
 * Page -- div within the page that usually has a border and has the text and contnet 
 * Hero panel (optional)
 * Title panel
 * Image (applies to ALL images within the page)
 * Section header
 * Paragraph
 * Table
 * List

Each one of these has the following style options:
 * Border - there is a library of border styles in BorderStyles.js, and then colors and radius need to be specified. Some borders include shadow options.
 * Font - Can specify any font from Google Fonts, size, italic (boolean), and for variable fonts, all the axes (weight, optical size, etc)
 * Text style - line height, indent, several options for underline (used for links)
 * Color - again, color can be a reference to a theme, OR be a specific light AND dark color
 * Background:
  * This is the most complicated. It can be one of: solid, gradient, pattern, or image
  * Solid is just one color
  * Gradient supports multiple stops of different colors, and different types and angles
  * Pattern - there's a library of CSS patterns in BackgroundStyles.js. Can specify colors and size. In the future, there
  will be some inline SVG styles as well in here. 
  * Image: Right now, this is a reference to an image on the site Picsum. In the future, other stock photo sites will be supported. Then you can adjust hue, saturation, value, size, fixed/scrolling and cover settings.
* Image - settings that apply to all images (which would be in the HTML, not the CSS)
* ImageButton (not yet implemented) - For making big clickable images with additional styling
* Section break style - there's a library of section break styles in SectionBreaks.js
* Spacing: padding and margin. For both, they can be either 1-way mode, 2-way mode, or 4-way mode where all, horizontal/vertical, and all 4 sides can be set. It also includes max-width. Spacing also has several options for mobile formatting which typically shrink the padding and margin by X%. All options can be set in em, rem, vh, or vw. 
* Link styles (not yet implemented, will include underline, background, hover highlight style, etc)
* Special options for lists and tables (not yet implemented)

EVERY class has the SAME control for styling it, which is called DivControl. (This is a bit misleading since
some have span styling, not div!). It outputs a data structure called the Div Data Model.

A complete theme is:
* A set of theme colors
* Some other global options
* A Div Data Model object for each class supported (Body, Header, Footer, Page, Hero, Title, Image, Section Header, Paragraph, Link, Table, List)

In the UI, some of the options in DivControl are disabled for some classes. For example, it does not make sense to change the section break style in Image, or the Link style in the Title panel, since those will never be used. But it is still the same DivControl for each class. 


Output:
* BlackQuartz allows exporting CSS or JSON
* In the exported CSS, the JSON format is actually embedded as a comment, so it can be reloaded later
* Or, you can save the JSON and reload that later alone
* It does not export anything other than CSS
* There is a library of preset JSON styles which you can select from as a starting point.

## UI

The UI consists of a left-side panel with editor options, and a right-side panel with a live preview. 
Nearly all the options are too complicated to fit in the left-side panel directly! Instead, they use InputDetailComponent. This component shows a small preview in the left-side panel, and then when you click it, it
opens a tear-off panel. The tear-off panel can be used either as a popup, OR by clicking the tearoff button, stays
as a persistent sub-window that can be dragged around and changed. For example, if the user wants to pick good paragraph
and section header fonts together, they can pull off these two panels and work on them at the same time side-by-side.

DivControl itself is not an InputDetailComponent. It does contain multiple InputDetailComponents, one for each 
supported style option. 

DivControl should be collapsible and have a title for the class it is editing. 


## Library examples:
Rather than having huge amounts of code for fancier CSS stuff (which would have to be duplicated in the preview
pane and in final generation), this is saved in libraryes in constants/ . 

###CSS Pattern in BackgroundStyles.js:

```
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
```

### CSS Border in BorderStyles.js

```
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
```

### Section break in SectionBreaks.js

```    
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
```

Eventually, there will be HUNDREDS of parameterized styles in these files. 




## Div Data Model Specification

The `DivControl` component emits a comprehensive style model that governs the styling for a panel container. The data model comprises four main sections: **Border**, **Spacing**, **Font**, and **Background**. This document describes each section in detail, providing the necessary information to later convert these settings into final CSS.

---

### Overall Structure

The final emitted model (via v-model) is an object with the following structure:

```js
{
  border: { /* Border properties */ },
  spacing: { /* Spacing properties */ },
  font: { /* Font properties */ },
  background: {
    type: "solid" | "gradient" | "image" | "cssPattern",
    value: { /* Background details vary by type */ }
  }
}
```

---

### 1. Border

**Description:**  
Specifies the border styling for the container.

**Expected Properties:**

- **borderWidth**:  
  - _Type_: Number or string  
  - _Description_: The width of the border (e.g., `2px`). In some cases, an object may be used to specify different values for each side (top, right, bottom, left).

- **borderStyle**:  
  - _Type_: String  
  - _Description_: The style of the border. Possible values include `none`, `solid`, `dashed`, `dotted`, etc.

- **borderColor**:  
  - _Type_: Color Object or String  
  - _Description_: The color of the border.  
  - _Details_:  
     A color can be specified as a simple string (e.g., `'#ff0000'`) or as an object to support themes:
     ```js
     {
       light: "#ff0000",
       dark: "#cc0000",
       // Optionally, a reference to a theme color index may be provided:
       themeReference: 1
     }
     ```

- **borderRadius**:  
  - _Type_: Number or string  
  - _Description_: Controls the rounding of corners (e.g., `5px`).

**Example (Solid Border):**
```js
border: {
  borderWidth: "2px",
  borderStyle: "solid",
  borderColor: { light: "#ff0000", dark: "#cc0000" },
  borderRadius: "4px"
}
```

---

### 2. Spacing

**Description:**  
Defines the internal (padding) and external (margin) spacing for the container.

**Expected Properties:**

- **padding**:  
  - _Type_: Object or Number  
  - _Description_: Padding can be specified as a single value (applied uniformly) or an object with top, right, bottom, and left values.
  
  - _Example Object_:
    ```js
    padding: {
      top: 10,
      right: 15,
      bottom: 10,
      left: 15
    }
    ```

- **margin**:  
  - _Type_: Object or Number  
  - _Description_: Similar to padding, margin may be specified as a single value or via an object.
  
  - _Example_:
    ```js
    margin: 20  // Applies 20px to all sides
    ```
    or
    ```js
    margin: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10
    }
    ```

---

### 3. Font

**Description:**  
Controls the typography used in the container.

**Expected Properties:**

- **fontFamily**:  
  - _Type_: String or Array of strings  
  - _Description_: The font family to use, e.g., `"Arial, sans-serif"`.

- **fontSize**:  
  - _Type_: Number or string  
  - _Description_: The size of the font (e.g., `14px`).

- **fontWeight**:  
  - _Type_: Number or string  
  - _Description_: The weight of the font (e.g., `400` or `bold`).

- **lineHeight**:  
  - _Type_: Number or string  
  - _Description_: The height of each line of text (e.g., `1.5` or `150%`).

- **letterSpacing**:  
  - _Type_: Number or string  
  - _Description_: Spacing between letters (e.g., `0.5px`).

- **fontStyle**:  
  - _Type_: String  
  - _Description_: The style of the font, such as `normal` or `italic`.

**Example:**
```js
font: {
  fontFamily: "Arial, sans-serif",
  fontSize: "14px",
  fontWeight: "400",
  lineHeight: "1.5",
  letterSpacing: "0.5px",
  fontStyle: "normal"
}
```

---

### 4. Background

**Description:**  
Handles the background styling for the container. The structure of the background value varies depending on the selected type.

### Overall Structure:
```js
background: {
  type: "solid" | "gradient" | "image" | "cssPattern",
  value: { /* details vary by type */ }
}
```

### a) **Solid**

- **value Properties:**
  - **color**:
    - _Type_: Color Object or String  
    - _Description_: The background color.  
    - _Details_: Supports both simple hex strings (e.g., `'#ffffff'`) and complex color objects:
      ```js
      {
        light: "#ffffff",
        dark: "#000000",
        themeReference: 2  // Optional: reference to a theme palette
      }
      ```
  - **opacity**:
    - _Type_: Number  
    - _Description_: A value between 0 and 1 representing the opacity of the background color.

**Example:**
```js
background: {
  type: "solid",
  value: {
    color: { light: "#ffffff", dark: "#f0f0f0" },
    opacity: 0.8
  }
}
```

### b) **Gradient**

- **value Properties:**
  - **type**:  
    - _Type_: String  
    - _Description_: Specifies the gradient type, e.g., `"linear"` or `"radial"`.
  - **angle** *(for linear gradients)*:  
    - _Type_: Number  
    - _Description_: The angle of the gradient in degrees.
  - **stops**:  
    - _Type_: Array of Color Stop Objects  
    - _Description_: Each color stop defines a point in the gradient.
      - **stop.color**:
        - _Type_: Color Object or String  
        - _Description_: The color at this stop.
      - **stop.position**:
        - _Type_: Number  
        - _Description_: A percentage (0–100) indicating the position of the stop.
  - **position** *(for radial gradients)*:  
    - _Type_: Object  
    - _Description_: Specifies the center of the gradient, e.g., `{ x: 50, y: 50 }` representing 50%/50%.

**Example:**
```js
background: {
  type: "gradient",
  value: {
    type: "linear",
    angle: 45,
    stops: [
      { color: { light: "#ff0000", dark: "#cc0000" }, position: 0 },
      { color: { light: "#00ff00", dark: "#00cc00" }, position: 50 },
      { color: { light: "#0000ff", dark: "#0000cc" }, position: 100 }
    ]
  }
}
```

### c) **Image**

- **value Properties:**
  - **source**:  
    - _Type_: String  
    - _Description_: Indicates the origin of the image, e.g., `"url"` or `"picsum"`.
  - **imageUrl**:  
    - _Type_: String  
    - _Description_: The URL of the image, if `source` is `"url"`.
  - **picsumId**:  
    - _Type_: String  
    - _Description_: The identifier for a Picsum image, if `source` is `"picsum"`.
  - **params**:  
    - _Type_: Object  
    - _Description_: Contains additional parameters for cropping, scaling, positioning, and CSS filters.\n    - **size**: e.g., `"cover"`, `"contain"`, `"100% 100%"`\n    - **position**: e.g., `"center"`, `"top left"`\n    - **repeat**: e.g., `"no-repeat"`, `"repeat"`\n    - **attachment**: e.g., `"scroll"`, `"fixed"`\n    - **scale**: Number value to scale the image\n    - **rotation**: Number in degrees\n    - **opacity**: A number between 0 and 1\n    - **filter adjustments**: e.g., `hueRotate`, `saturate`, `brightness`, `contrast`
  
**Example:**
```js
background: {
  type: "image",
  value: {
    source: "url",
    imageUrl: "https://example.com/background.jpg",
    params: {
      size: "cover",
      position: "center",
      repeat: "no-repeat",
      attachment: "scroll",
      scale: 1,
      rotation: 0,
      opacity: 1,
      hueRotate: 0,
      saturate: 100,
      brightness: 100,
      contrast: 100
    }
  }
}
```

### d) **CSS Pattern**

- **value Properties:**
  - **patternId**:  
    - _Type_: String  
    - _Description_: The identifier for the pattern.
  - **params**:  
    - _Type_: Object  
    - _Description_: Additional parameters for pattern scaling, color adjustments, or other effects as defined by the pattern system.

**Example:**
```js
background: {
  type: "cssPattern",
  value: {
    patternId: "stripes",
    params: {
      scale: 1,
      // ...other pattern parameters
    }
  }
}
```

---

## Additional Notes

- **Color Object Complexity:**  
  Color properties are especially complex as they can handle multiple modes (light/dark) and references to a theme. For instance, a color can either be a direct hex string, or an object with specific keys:
  ```js
  { light: "#ffffff", dark: "#000000", themeReference: 3 }
  ```
  This design supports dynamic theming, where the final CSS must select the appropriate color based on the active theme (light or dark mode).

- **Data Transformation to CSS:**  
  When converting this data model to CSS:
  - Ensure that numerical values are appended with appropriate units (e.g., `px` for sizes) unless already specified.
  - For color objects, logic must choose a color based on the current theme (using the `light` or `dark` property) or, if using a theme reference, fetch the color from the theme's palette.
  - Combine the properties in a coherent CSS rule for properties like `border`, `padding`, `font`, and `background`.

- **Validation and Defaults:**  
  Some fields are optional. The DivControl component uses defaults on initialization. This documentation assumes defaults have been applied where necessary.

---

## Conclusion

This detailed data model specification provides a comprehensive guide to the structure of the style object emitted by the `DivControl` component. It defines each property’s expected type, possible values, and examples of usage. This detailed documentation will be crucial for any subsequent transformations (such as generating final CSS) from the model.

-----------------------------------------------------

This document is now available as "PanelDivisionDataModel.md" in your project. 

Would you like any further modifications or additional documentation for other components?