<template>
    <div class="shape-editor">
      <div class="editor-container">
        <div class="editor-header">
          <h3>CSS Shape Editor</h3>
          <div class="element-selector">
            <label for="element-select">Apply to:</label>
            <select id="element-select" v-model="selectedElement">
              <option v-for="element in elements" :key="element.id" :value="element.id">
                {{ element.label }}
              </option>
            </select>
          </div>
        </div>
  
        <div class="editor-body">
          <!-- Border Radius -->
          <div class="property-group">
            <div class="property-header">
              <h4>Border Radius</h4>
              <div class="unit-selector">
                <select v-model="shapeStyles.borderRadius.unit">
                  <option v-for="unit in units" :key="unit" :value="unit">{{ unit }}</option>
                </select>
              </div>
            </div>
            <div class="property-input">
              <input type="number" v-model="shapeStyles.borderRadius.value" min="0" step="1" />
            </div>
          </div>
  
          <!-- Padding -->
          <div class="property-group">
            <div class="property-header">
              <h4>Padding</h4>
              <div class="mode-selector">
                <button 
                  v-for="mode in paddingModes" 
                  :key="mode.id" 
                  :class="{ active: paddingMode === mode.id }"
                  @click="paddingMode = mode.id"
                >
                  {{ mode.label }}
                </button>
              </div>
              <div class="unit-selector">
                <select v-model="shapeStyles.padding.unit">
                  <option v-for="unit in units" :key="unit" :value="unit">{{ unit }}</option>
                </select>
              </div>
            </div>
  
            <!-- All Padding -->
            <div class="property-input" v-if="paddingMode === 'all'">
              <label>All</label>
              <input type="number" v-model="shapeStyles.padding.all" min="0" step="1" />
            </div>
  
            <!-- Horizontal/Vertical Padding -->
            <div class="property-input-row" v-if="paddingMode === 'axial'">
              <div>
                <label>Horizontal</label>
                <input type="number" v-model="shapeStyles.padding.horizontal" min="0" step="1" />
              </div>
              <div>
                <label>Vertical</label>
                <input type="number" v-model="shapeStyles.padding.vertical" min="0" step="1" />
              </div>
            </div>
  
            <!-- Individual Padding -->
            <div class="property-input-grid" v-if="paddingMode === 'individual'">
              <div>
                <label>Top</label>
                <input type="number" v-model="shapeStyles.padding.top" min="0" step="1" />
              </div>
              <div>
                <label>Right</label>
                <input type="number" v-model="shapeStyles.padding.right" min="0" step="1" />
              </div>
              <div>
                <label>Bottom</label>
                <input type="number" v-model="shapeStyles.padding.bottom" min="0" step="1" />
              </div>
              <div>
                <label>Left</label>
                <input type="number" v-model="shapeStyles.padding.left" min="0" step="1" />
              </div>
            </div>
          </div>
  
          <!-- Margin -->
          <div class="property-group">
            <div class="property-header">
              <h4>Margin</h4>
              <div class="mode-selector">
                <button 
                  v-for="mode in marginModes" 
                  :key="mode.id" 
                  :class="{ active: marginMode === mode.id }"
                  @click="marginMode = mode.id"
                >
                  {{ mode.label }}
                </button>
              </div>
              <div class="unit-selector">
                <select v-model="shapeStyles.margin.unit">
                  <option v-for="unit in units" :key="unit" :value="unit">{{ unit }}</option>
                </select>
              </div>
            </div>
  
            <!-- All Margin -->
            <div class="property-input" v-if="marginMode === 'all'">
              <label>All</label>
              <input type="number" v-model="shapeStyles.margin.all" min="0" step="1" />
            </div>
  
            <!-- Horizontal/Vertical Margin -->
            <div class="property-input-row" v-if="marginMode === 'axial'">
              <div>
                <label>Horizontal</label>
                <input type="number" v-model="shapeStyles.margin.horizontal" min="0" step="1" />
              </div>
              <div>
                <label>Vertical</label>
                <input type="number" v-model="shapeStyles.margin.vertical" min="0" step="1" />
              </div>
            </div>
  
            <!-- Individual Margin -->
            <div class="property-input-grid" v-if="marginMode === 'individual'">
              <div>
                <label>Top</label>
                <input type="number" v-model="shapeStyles.margin.top" min="0" step="1" />
              </div>
              <div>
                <label>Right</label>
                <input type="number" v-model="shapeStyles.margin.right" min="0" step="1" />
              </div>
              <div>
                <label>Bottom</label>
                <input type="number" v-model="shapeStyles.margin.bottom" min="0" step="1" />
              </div>
              <div>
                <label>Left</label>
                <input type="number" v-model="shapeStyles.margin.left" min="0" step="1" />
              </div>
            </div>
          </div>
  
          <!-- Width -->
          <div class="property-group">
            <div class="property-header">
              <h4>Width</h4>
              <div class="unit-selector">
                <select v-model="shapeStyles.width.unit">
                  <option v-for="unit in units" :key="unit" :value="unit">{{ unit }}</option>
                </select>
              </div>
            </div>
            <div class="property-input">
              <input type="number" v-model="shapeStyles.width.value" min="0" step="1" />
            </div>
          </div>
  
          <!-- Min Width -->
          <div class="property-group">
            <div class="property-header">
              <h4>Min Width</h4>
              <div class="unit-selector">
                <select v-model="shapeStyles.minWidth.unit">
                  <option v-for="unit in units" :key="unit" :value="unit">{{ unit }}</option>
                </select>
              </div>
            </div>
            <div class="property-input">
              <input type="number" v-model="shapeStyles.minWidth.value" min="0" step="1" />
            </div>
          </div>
        </div>
  
        <div class="editor-footer">
          <button @click="applyStyles" class="apply-button">Apply to {{ getElementLabel }}</button>
          <button @click="resetStyles" class="reset-button">Reset</button>
        </div>
      </div>
  
      <div class="preview-container">
        <h3>Preview</h3>
        <div class="preview-wrapper">
          <div class="preview-box" :style="computedStyles">
            <div v-if="selectedElement === 'images'" class="preview-content image-preview">
              <div class="image-placeholder">Image</div>
            </div>
            <div v-else-if="selectedElement === 'page'" class="preview-content page-preview">
              <div class="text-placeholder">Page Content</div>
            </div>
            <div v-else-if="selectedElement === 'aside'" class="preview-content aside-preview">
              <div class="text-placeholder">Aside Box</div>
            </div>
            <div v-else-if="selectedElement === 'hero'" class="preview-content hero-preview">
              <div class="text-placeholder">Hero Panel</div>
            </div>
          </div>
        </div>
        <div class="css-output">
          <h4>Generated CSS</h4>
          <pre>{{ cssOutput }}</pre>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ShapeEditor',
    data() {
      return {
        selectedElement: 'images',
        elements: [
          { id: 'images', label: 'All Images' },
          { id: 'page', label: 'Page' },
          { id: 'aside', label: 'Aside Boxes' },
          { id: 'hero', label: 'Hero Panel' }
        ],
        units: ['px', '%', 'em', 'rem', 'vh', 'vw'],
        paddingMode: 'all',
        paddingModes: [
          { id: 'all', label: 'All' },
          { id: 'axial', label: 'H/V' },
          { id: 'individual', label: 'Individual' }
        ],
        marginMode: 'all',
        marginModes: [
          { id: 'all', label: 'All' },
          { id: 'axial', label: 'H/V' },
          { id: 'individual', label: 'Individual' }
        ],
        shapeStyles: {
          borderRadius: {
            value: 8,
            unit: 'px'
          },
          padding: {
            all: 16,
            horizontal: 16,
            vertical: 16,
            top: 16,
            right: 16,
            bottom: 16,
            left: 16,
            unit: 'px'
          },
          margin: {
            all: 8,
            horizontal: 8,
            vertical: 8,
            top: 8,
            right: 8,
            bottom: 8,
            left: 8,
            unit: 'px'
          },
          width: {
            value: 100,
            unit: '%'
          },
          minWidth: {
            value: 200,
            unit: 'px'
          }
        },
        elementStyles: {
          images: {},
          page: {},
          aside: {},
          hero: {}
        }
      };
    },
    computed: {
      getElementLabel() {
        const element = this.elements.find(el => el.id === this.selectedElement);
        return element ? element.label : '';
      },
      computedStyles() {
        // Calculate the padding based on the current mode
        let paddingValue = '';
        if (this.paddingMode === 'all') {
          paddingValue = `${this.shapeStyles.padding.all}${this.shapeStyles.padding.unit}`;
        } else if (this.paddingMode === 'axial') {
          paddingValue = `${this.shapeStyles.padding.vertical}${this.shapeStyles.padding.unit} ${this.shapeStyles.padding.horizontal}${this.shapeStyles.padding.unit}`;
        } else if (this.paddingMode === 'individual') {
          paddingValue = `${this.shapeStyles.padding.top}${this.shapeStyles.padding.unit} ${this.shapeStyles.padding.right}${this.shapeStyles.padding.unit} ${this.shapeStyles.padding.bottom}${this.shapeStyles.padding.unit} ${this.shapeStyles.padding.left}${this.shapeStyles.padding.unit}`;
        }
  
        // Calculate the margin based on the current mode
        let marginValue = '';
        if (this.marginMode === 'all') {
          marginValue = `${this.shapeStyles.margin.all}${this.shapeStyles.margin.unit}`;
        } else if (this.marginMode === 'axial') {
          marginValue = `${this.shapeStyles.margin.vertical}${this.shapeStyles.margin.unit} ${this.shapeStyles.margin.horizontal}${this.shapeStyles.margin.unit}`;
        } else if (this.marginMode === 'individual') {
          marginValue = `${this.shapeStyles.margin.top}${this.shapeStyles.margin.unit} ${this.shapeStyles.margin.right}${this.shapeStyles.margin.unit} ${this.shapeStyles.margin.bottom}${this.shapeStyles.margin.unit} ${this.shapeStyles.margin.left}${this.shapeStyles.margin.unit}`;
        }
  
        return {
          borderRadius: `${this.shapeStyles.borderRadius.value}${this.shapeStyles.borderRadius.unit}`,
          padding: paddingValue,
          margin: marginValue,
          width: `${this.shapeStyles.width.value}${this.shapeStyles.width.unit}`,
          minWidth: `${this.shapeStyles.minWidth.value}${this.shapeStyles.minWidth.unit}`,
          boxSizing: 'border-box',
          border: '1px dashed #999',
          backgroundColor: '#f5f5f5'
        };
      },
      cssOutput() {
        const selector = this.getCssSelector();
        
        // Generate the CSS string based on the current styles
        let css = `${selector} {\n`;
        css += `  border-radius: ${this.computedStyles.borderRadius};\n`;
        css += `  padding: ${this.computedStyles.padding};\n`;
        css += `  margin: ${this.computedStyles.margin};\n`;
        css += `  width: ${this.computedStyles.width};\n`;
        css += `  min-width: ${this.computedStyles.minWidth};\n`;
        css += `}`;
        
        return css;
      }
    },
    methods: {
      getCssSelector() {
        // Return the appropriate CSS selector based on the selected element
        switch (this.selectedElement) {
          case 'images':
            return 'img';
          case 'page':
            return '.page-container';
          case 'aside':
            return '.aside-box';
          case 'hero':
            return '.hero-panel';
          default:
            return '';
        }
      },
      applyStyles() {
        // Store the current styles for the selected element
        this.elementStyles[this.selectedElement] = JSON.parse(JSON.stringify(this.shapeStyles));
        
        // In a real app, this would save the styles or apply them to the actual elements
        alert(`Styles applied to ${this.getElementLabel}`);
      },
      resetStyles() {
        // Reset to default values
        this.shapeStyles = {
          borderRadius: {
            value: 8,
            unit: 'px'
          },
          padding: {
            all: 16,
            horizontal: 16,
            vertical: 16,
            top: 16,
            right: 16,
            bottom: 16,
            left: 16,
            unit: 'px'
          },
          margin: {
            all: 8,
            horizontal: 8,
            vertical: 8,
            top: 8,
            right: 8,
            bottom: 8,
            left: 8,
            unit: 'px'
          },
          width: {
            value: 100,
            unit: '%'
          },
          minWidth: {
            value: 200,
            unit: 'px'
          }
        };
        this.paddingMode = 'all';
        this.marginMode = 'all';
      }
    }
  };
  </script>
  
  <style scoped>
  .shape-editor {
    display: flex;
    gap: 20px;
    max-width: 1000px;
    margin: 0 auto;
    font-family: Arial, sans-serif;
  }
  
  .editor-container {
    flex: 1;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 15px;
    background-color: white;
    max-width: 500px;
  }
  
  .preview-container {
    flex: 1;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 15px;
    background-color: white;
  }
  
  .editor-header, .editor-footer {
    margin-bottom: 15px;
  }
  
  .editor-header h3, .preview-container h3 {
    margin-top: 0;
    margin-bottom: 10px;
  }
  
  .element-selector {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  
  .element-selector select {
    padding: 5px;
    border-radius: 4px;
    border: 1px solid #ddd;
  }
  
  .property-group {
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
  }
  
  .property-header {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .property-header h4 {
    margin: 0;
    flex: 1;
  }
  
  .unit-selector {
    margin-left: 10px;
  }
  
  .unit-selector select {
    padding: 2px 5px;
    border-radius: 4px;
    border: 1px solid #ddd;
  }
  
  .mode-selector {
    display: flex;
    gap: 5px;
  }
  
  .mode-selector button {
    padding: 3px 8px;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.8em;
  }
  
  .mode-selector button.active {
    background-color: #e0e0e0;
    border-color: #999;
  }
  
  .property-input {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .property-input input, .property-input-row input, .property-input-grid input {
    width: 60px;
    padding: 5px;
    border-radius: 4px;
    border: 1px solid #ddd;
  }
  
  .property-input-row {
    display: flex;
    gap: 15px;
  }
  
  .property-input-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  
  .preview-wrapper {
    border: 1px solid #eee;
    padding: 20px;
    margin-bottom: 15px;
    background-color: #fafafa;
  }
  
  .preview-box {
    box-sizing: border-box;
    transition: all 0.3s ease;
  }
  
  .preview-content {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 150px;
    background-color: #e0e0e0;
    color: #666;
    text-align: center;
  }
  
  .image-placeholder {
    font-size: 24px;
  }
  
  .text-placeholder {
    font-size: 18px;
  }
  
  .css-output {
    margin-top: 15px;
  }
  
  .css-output pre {
    background-color: #f5f5f5;
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
    font-family: monospace;
    font-size: 14px;
  }
  
  .editor-footer {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }
  
  .apply-button, .reset-button {
    padding: 8px 15px;
    border-radius: 4px;
    cursor: pointer;
    border: none;
  }
  
  .apply-button {
    background-color: #4CAF50;
    color: white;
  }
  
  .reset-button {
    background-color: #f5f5f5;
    border: 1px solid #ddd;
  }
  </style>