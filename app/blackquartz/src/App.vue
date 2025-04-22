<template>
  <div id="app">
    <editor-controls 
      :theme="theme" 
      :editor-state="editorState" 
      :is-loading="isLoading"
      @update-preview="updatePreview" 
      @toggle-dark-mode="toggleColorMode" 
      @toggle-group="toggleGroup"
      @generate-new-lorem="generateNewLorem" 
      @search-wikipedia="searchWikipedia"
      @select-wiki-article="selectWikiArticle" 
      @fetch-wiki-article="fetchWikiArticleContent"
      @open-background-editor="openBackgroundEditor" 
      @open-font-selector="openFontSelector"
      @open-color-picker="openColorPicker" 
      @open-color-theme="openColorThemeEditor" 
      @export-css="exportCSS" 
      @export-html="exportHTML" 
      @copy-css="copyCSS"
      @export-theme-json="exportThemeJSON" 
      @import-theme-json="importThemeJSON"
      @apply-preset="applyPreset">
    </editor-controls>
  <div style="flex: 1; border: 3px solid green; min-width: 0;">
    <theme-preview 
      :theme="theme" 
      :editor-state="editorState" 
      :is-loading="isLoading" 
      ref="preview">
    </theme-preview>
</div>
    <background-editor 
      v-if="editorState.showBackgroundEditor" 
      :background="editorState.tempBackground"
      :target="editorState.currentBackgroundTarget" 
      :color-mode="editorState.colorMode"
      @save="saveBackgroundSettings" 
      @close="editorState.showBackgroundEditor = false">
    </background-editor>

    <font-selector 
      v-if="editorState.showFontSelector" 
      :font-family="editorState.tempFontFamily"
      :target="editorState.fontSelectorTarget" 
      :tab="editorState.fontSelectorTab" 
      :search="editorState.fontSearch"
      @save="saveFontSelection" 
      @close="editorState.showFontSelector = false"
      @set-tab="editorState.fontSelectorTab = $event" 
      @set-search="editorState.fontSearch = $event"
      @select-font="selectFont" 
      @select-pairing="applyFontPairing">
    </font-selector>

    <color-picker 
      v-if="editorState.showColorPicker" 
      :color="editorState.tempColor"
      :target="editorState.colorPickerTarget" 
      :mode="editorState.colorMode" 
      @save="saveColorSelection"
      @close="editorState.showColorPicker = false" 
      @set-color="editorState.tempColor = $event">
    </color-picker>

    <color-theme-editor 
  v-if="editorState.showColorThemeEditor" 
  :theme="theme"
  :color-mode="editorState.colorMode"
  @save="saveColorTheme" 
  @close="editorState.showColorThemeEditor = false">
</color-theme-editor>
  </div>
</template>

<script>
import EditorControls from './components/EditorControls.vue';
import ThemePreview from './components/ThemePreview.vue';
import BackgroundEditor from './components/editors/BackgroundEditor.vue';
import FontSelector from './components/editors/FontSelector.vue';
import ColorPicker from './components/editors/ColorPicker.vue';
import ThemePresets from '../constants/ThemePresets';
import ThemeUtils from './services/ThemeUtils';
import ThemeIO from './services/ThemeIO';
import CSSGenerator from './services/CSSGenerator';
import ColorThemeEditor from './components/editors/ColorThemeEditor.vue';
import ThemedColorInput from './components/controls/ThemedColorInput.vue';
export default {
  name: 'App',
  components: {
    EditorControls,
    ThemePreview,
    BackgroundEditor,
    FontSelector,
    ColorPicker,
    ColorThemeEditor,
  },
  // New style lifecycle hook for Vue 3
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  },
  data() {
    return {
      // Theme data structure - holds all theme settings
      theme: { ...ThemePresets.defaultTheme(), bodyStyle: {}, pageStyle: {} },

      // Editor state - holds UI state not directly related to the theme
      editorState: {
        activeTab: 'design',
        isLoading: false,
        colorMode: 'light',
        collapsedGroups: {
          contentSource: false,
          background: false,
          page: false,
          typography: false,
          hero: false,
          images: false,
          sections: false,
          blockquote: true,
          table: true,
          list: true,
          imageLinks: false,
          advanced: true
        },

        // Background editor state
        showBackgroundEditor: false,
        currentBackgroundTarget: 'body',
        tempBackground: null,

        // Font selector state
        showFontSelector: false,
        fontSelectorTarget: 'body',
        fontSelectorTab: 'popular',
        fontSearch: '',
        tempFontFamily: '',

        // Color picker state
        showColorPicker: false,
        colorPickerTarget: '',
        tempColor: null,
        showColorThemeEditor: false,
        // Wiki state
        wiki: {
          search: '',
          searching: false,
          error: null,
          results: [],
          currentArticle: null,
          content: null
        },

        // Content generation
        loremTextCache: null
      }
    };
  },
  computed: {
    css() {
      return CSSGenerator.generateCSS(this.theme, this.editorState.colorMode);
    },
    isLoading() {
      return this.editorState.isLoading;
    },
    loadedFonts() {
      // Check if theme and theme.type exist
      if (!this.theme || !this.theme.type) {
        return [];
      }

      // Get unique fonts that need to be loaded
      const bodyFont = (this.theme.type.bodyFont || "'Inter', sans-serif").split("'")[1];
      const headingFont = (this.theme.type.headingFont || "'Inter', sans-serif").split("'")[1];

      let fontList = [bodyFont];
      if (headingFont !== bodyFont) {
        fontList.push(headingFont);
      }

      return fontList.map(font =>
        `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@400;700&display=swap`
      );
    }
  },
  mounted() {
    // Initialize the theme
    this.theme.loadedFonts = this.loadedFonts || [];

    // Initialize content
    if (this.theme.content && this.theme.content.source === 'lorem') {
      this.generateLoremTextCache();
    }

    // Initialize the preview
    this.updatePreview();

    // Set up debounced update preview function for responsive changes
    this.$watch('theme.responsivePreview', ThemeUtils.debounce(() => {
      this.updatePreview();
    }, 300), { deep: true });

    // Watch for color mode changes
    this.$watch('editorState.colorMode', () => {
      this.updatePreview();
    });

    // Watch for theme changes that should update preview
    this.$watch('theme', ThemeUtils.debounce(() => {
      this.updatePreview();
    }, 500), { deep: true });

    // Add event listener for Ctrl+S to export CSS
    document.addEventListener('keydown', this.handleKeyDown);
  },
  methods: {

    // Color theme methods
openColorThemeEditor() {
  this.editorState.showColorThemeEditor = true;
},

saveColorTheme(colorTheme) {
  // Store the color theme in the theme object
  this.theme.colorTheme = JSON.parse(JSON.stringify(colorTheme));
  
  // Close the editor
  this.editorState.showColorThemeEditor = false;
  
  // Update the preview
  this.updatePreview();
},

    // Background editor methods
    openBackgroundEditor(target) {
      this.editorState.currentBackgroundTarget = target;

      // Create default background structure if missing
      const defaultBackground = {
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
      };

      // Initialize backgrounds object if it doesn't exist
      if (!this.theme.backgrounds) {
        this.theme.backgrounds = {};
      }

      // Make sure the target background exists with all required properties
      if (!this.theme.backgrounds[target]) {
        this.theme.backgrounds[target] = JSON.parse(JSON.stringify(defaultBackground));
      } else {
        // Ensure all properties exist (in case of partial initialization)
        const currentBg = this.theme.backgrounds[target];

        // Make sure type exists
        if (!currentBg.type) {
          currentBg.type = 'color';
        }

        // Ensure color object exists
        if (!currentBg.color) {
          currentBg.color = defaultBackground.color;
        }

        // Ensure gradient object exists
        if (!currentBg.gradient) {
          currentBg.gradient = defaultBackground.gradient;
        }

        // Ensure pattern object exists
        if (!currentBg.pattern) {
          currentBg.pattern = defaultBackground.pattern;
        }

        // Ensure texture object exists
        if (!currentBg.texture) {
          currentBg.texture = defaultBackground.texture;
        }

        // Ensure image object exists
        if (!currentBg.image) {
          currentBg.image = defaultBackground.image;
        }

        // Ensure overlay object exists
        if (!currentBg.overlay) {
          currentBg.overlay = defaultBackground.overlay;
        }
      }

      // Clone the current background settings to temp
      this.editorState.tempBackground = JSON.parse(JSON.stringify(this.theme.backgrounds[target]));

      // Show the editor
      this.editorState.showBackgroundEditor = true;
    },

    saveBackgroundSettings(background) {
      // Apply the temp settings to the actual background
      this.theme.backgrounds[this.editorState.currentBackgroundTarget] = JSON.parse(JSON.stringify(background));

      // Close the editor
      this.editorState.showBackgroundEditor = false;

      // Update the preview
      this.updatePreview();
    },

    // Font selector methods
    openFontSelector(target) {
      this.editorState.fontSelectorTarget = target;
      this.editorState.fontSelectorTab = 'popular';
      this.editorState.fontSearch = '';

      // Set the initial font based on target
      if (target === 'body') {
        this.editorState.tempFontFamily = this.theme.type.bodyFont;
      } else {
        this.editorState.tempFontFamily = this.theme.type.headingFont;
      }

      this.editorState.showFontSelector = true;
    },

    selectFont(font) {
      this.editorState.tempFontFamily = `'${font.family}', ${font.category}`;
    },

    applyFontPairing(pairing) {
      if (this.editorState.fontSelectorTarget === 'body') {
        this.editorState.tempFontFamily = pairing.body;
        this.theme.type.headingFont = pairing.heading;
      } else {
        this.editorState.tempFontFamily = pairing.heading;
        this.theme.type.bodyFont = pairing.body;
      }
    },

    saveFontSelection() {
      if (this.editorState.fontSelectorTarget === 'body') {
        this.theme.type.bodyFont = this.editorState.tempFontFamily;
      } else {
        this.theme.type.headingFont = this.editorState.tempFontFamily;
      }

      this.editorState.showFontSelector = false;
      this.updatePreview();
    },

    // Color picker methods
    openColorPicker(target) {
  this.editorState.colorPickerTarget = target;

  // Set initial color based on target
  if (target === 'text') {
    this.editorState.tempColor = this.theme.type.textColor;
  } else if (target === 'title') {
    this.editorState.tempColor = this.theme.type.titleColor;
  } else if (target === 'heading') {
    this.editorState.tempColor = this.theme.type.headingColor;
  } else if (target === 'page-border') {
    this.editorState.tempColor = this.theme.page.borderColor;
  }

  this.editorState.showColorPicker = true;
},

    saveColorSelection(dualColor) {
      if (this.editorState.colorPickerTarget === 'text') {
        this.theme.type.textColor = dualColor;
      } else if (this.editorState.colorPickerTarget === 'title') {
        this.theme.type.titleColor = dualColor;
      } else if (this.editorState.colorPickerTarget === 'heading') {
        this.theme.type.headingColor = dualColor;
      } else if (this.editorState.colorPickerTarget === 'page-border') {
        this.theme.page.borderColor = dualColor;
      }

      this.editorState.showColorPicker = false;
      this.updatePreview();
    },

    // Group toggle
    toggleGroup(groupName) {
      this.editorState.collapsedGroups[groupName] = !this.editorState.collapsedGroups[groupName];
    },

    // Toggle color mode
    toggleColorMode() {
      this.editorState.colorMode = this.editorState.colorMode === 'light' ? 'dark' : 'light';
      this.updatePreview();
    },

    // Content methods
    generateNewLorem() {
      this.editorState.loremTextCache = null;
      this.generateLoremTextCache();
      this.updatePreview();
    },

    generateLoremTextCache() {
      // Generate and cache lorem text so it doesn't change when design changes
      const paragraphs = [];

      // First paragraph always starts with the requested text
      paragraphs.push("Sphinx of black quartz, judge my vow! " + this.getLoremText());

      // Generate remaining paragraphs
      for (let i = 1; i < 20; i++) {
        paragraphs.push(this.getLoremText());
      }

      this.editorState.loremTextCache = paragraphs;
    },

    getLoremText() {
      const loremTexts = [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam vehicula ipsum a arcu cursus vitae congue mauris rhoncus. Aenean et justo at enim pulvinar malesuada.",
        "Vestibulum sed arcu non odio euismod lacinia at quis risus. Semper quis lectus nulla at volutpat diam ut venenatis tellus. Bibendum est ultricies integer quis auctor.",
        "Faucibus interdum posuere lorem ipsum dolor sit amet consectetur adipiscing. Platea dictumst vestibulum rhoncus est pellentesque elit ullamcorper dignissim cras.",
        "Amet porttitor eget dolor morbi non arcu risus quis varius. Ut enim blandit volutpat maecenas volutpat blandit aliquam etiam erat velit.",
        "Cras fermentum odio eu feugiat pretium nibh ipsum consequat. Magna etiam tempor orci eu lobortis elementum nibh tellus molestie nunc.",
        "Ultricies tristique nulla aliquet enim tortor at auctor urna nunc. Semper auctor neque vitae tempus quam pellentesque nec nam aliquam.",
        "Proin sagittis nisl rhoncus mattis rhoncus urna neque viverra justo. Imperdiet proin fermentum leo vel orci porta non pulvinar neque."
      ];

      // Return a random lorem text
      return loremTexts[Math.floor(Math.random() * loremTexts.length)];
    },

    // Wikipedia search and content fetching
    searchWikipedia: ThemeUtils.debounce(function (query) {
      if (query.length < 3) {
        this.editorState.wiki.results = [];
        return;
      }

      this.editorState.wiki.searching = true;
      this.editorState.wiki.error = null;

      try {
        const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
        fetch(url)
          .then(response => response.json())
          .then(data => {
            if (data.query && data.query.search) {
              this.editorState.wiki.results = data.query.search;
            } else {
              this.editorState.wiki.results = [];
              this.editorState.wiki.error = "No results found";
            }
            this.editorState.wiki.searching = false;
          })
          .catch(error => {
            this.editorState.wiki.error = "Error searching Wikipedia: " + error.message;
            this.editorState.wiki.results = [];
            this.editorState.wiki.searching = false;
          });
      } catch (error) {
        this.editorState.wiki.error = "Error searching Wikipedia: " + error.message;
        this.editorState.wiki.results = [];
        this.editorState.wiki.searching = false;
      }
    }, 500),

    selectWikiArticle(article) {
      this.editorState.wiki.currentArticle = article;
      this.editorState.wiki.results = [];
    },

    async fetchWikiArticleContent() {
      if (!this.editorState.wiki.currentArticle) return;

      this.editorState.isLoading = true;

      try {
        // Fetch article extract
        const extractUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(this.editorState.wiki.currentArticle.title)}?origin=*`;
        const extractResponse = await fetch(extractUrl);
        const extractData = await extractResponse.json();

        // Fetch mobile HTML for sections
        const mobileHtmlUrl = `https://en.wikipedia.org/api/rest_v1/page/mobile-html/${encodeURIComponent(this.editorState.wiki.currentArticle.title)}?origin=*`;
        const response = await fetch(mobileHtmlUrl);
        const html = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // Get sections from HTML
        const sectionElements = doc.querySelectorAll("section");
        const sections = Array.from(sectionElements).map(section => {
          const heading = section.querySelector("h2, h3, h4, h5, h6")?.textContent.trim() || '';
          return {
            heading,
            content: section.innerHTML
          };
        });

        // Process content
        this.editorState.wiki.content = {
          title: extractData.title,
          extract: extractData.extract,
          thumbnail: extractData.thumbnail?.source,
          sections: sections
        };

        this.updatePreview();
      } catch (error) {
        this.editorState.wiki.error = "Error fetching Wikipedia content: " + error.message;
      } finally {
        this.editorState.isLoading = false;
      }
    },

    // Export/Import methods
    exportCSS() {
      const css = ThemeIO.exportCSS(this.theme, this.editorState.colorMode);

      const blob = new Blob([css], { type: 'text/css' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'blackquartz-theme.css';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    exportHTML() {
      const htmlContent = this.getSampleHTML();
      const html = ThemeIO.exportHTML(this.theme, this.css, htmlContent);

      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'blackquartz-demo.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    copyCSS() {
      const tempTextarea = document.createElement('textarea');
      tempTextarea.value = this.css;
      document.body.appendChild(tempTextarea);
      tempTextarea.select();
      document.execCommand('copy');
      document.body.removeChild(tempTextarea);

      alert('CSS copied to clipboard!');
    },

    exportThemeJSON() {
      const themeData = JSON.stringify(this.theme, null, 2);
      const blob = new Blob([themeData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'blackquartz-theme.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    importThemeJSON() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,.css';

      input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = event => {
          try {
            const fileContent = event.target.result;
            const fileType = file.name.endsWith('.css') ? 'css' : 'json';

            let themeData;

            // Extract JSON from CSS file if needed
            if (fileType === 'css') {
              const startMarker = 'START_BLACKQUARTZ_THEME';
              const endMarker = 'END_BLACKQUARTZ_THEME';

              const startIndex = fileContent.indexOf(startMarker);
              const endIndex = fileContent.indexOf(endMarker);

              if (startIndex !== -1 && endIndex !== -1) {
                const jsonContent = fileContent.substring(startIndex + startMarker.length, endIndex).trim();
                themeData = JSON.parse(jsonContent);
              } else {
                throw new Error('No theme data found in CSS file');
              }
            } else {
              themeData = JSON.parse(fileContent);
            }

            // Update theme with imported data
            this.theme = themeData;

            // Update the preview
            this.updatePreview();
          } catch (error) {
            alert('Error importing theme: ' + error.message);
          }
        };
        reader.readAsText(file);
      };

      input.click();
    },

    // Apply preset theme
    applyPreset(preset) {
      // Create a copy of the current theme
      const baseTheme = JSON.parse(JSON.stringify(this.theme));

      // Get preset data
      let presetData = {};

      // Apply different preset themes based on preset name
      switch (preset) {
        case 'modern':
          // Modern minimal preset
          presetData = {
            backgrounds: {
              body: {
                type: 'color',
                color: { light: '#ffffff', dark: '#121212' }
              },
              page: {
                type: 'color',
                color: { light: '#ffffff', dark: '#1f1f1f' }
              },
              hero: {
                type: 'gradient',
                gradient: {
                  type: 'linear',
                  angle: 135,
                  stops: [
                    { color: { light: '#f8fafc', dark: '#0c4a6e' }, position: 0 },
                    { color: { light: '#f1f5f9', dark: '#0369a1' }, position: 100 }
                  ]
                }
              }
            },
            page: {
              shadowSize: 15,
              borderSize: 0,
              paddingX: 60,
              paddingY: 60,
              maxWidth: 900
            },
            type: {
              bodyFont: "'Inter', sans-serif",
              headingFont: "'Inter', sans-serif",
              lineHeight: 1.7,
              titleColor: { light: '#111827', dark: '#f9fafb' },
              headingColor: { light: '#1f2937', dark: '#f1f5f9' },
              textColor: { light: '#4b5563', dark: '#d1d5db' },
              linkColor: { light: '#2563eb', dark: '#60a5fa' },
              linkHoverColor: { light: '#1d4ed8', dark: '#93c5fd' }
            }
          };
          break;
        case 'dark':
          // Dark mode preset
          presetData = {
            colorMode: 'dark',
            backgrounds: {
              body: {
                type: 'gradient',
                gradient: {
                  type: 'linear',
                  angle: 135,
                  stops: [
                    { color: { light: '#f8f9fa', dark: '#111827' }, position: 0 },
                    { color: { light: '#e9ecef', dark: '#1f2937' }, position: 100 }
                  ]
                }
              }
            },
            type: {
              bodyFont: "'Inter', sans-serif",
              headingFont: "'Inter', sans-serif",
              lineHeight: 1.8,
              titleColor: { light: '#212529', dark: '#f9fafb' },
              headingColor: { light: '#343a40', dark: '#f3f4f6' },
              headingStyle: 'leftBorder',
              textColor: { light: '#495057', dark: '#d1d5db' },
              linkColor: { light: '#0d6efd', dark: '#60a5fa' },
              linkHoverColor: { light: '#0a58ca', dark: '#93c5fd' }
            }
          };
          break;
        // Other presets would go here
      }

      // Merge the preset data with the current theme
      const mergeTheme = function (target, source) {
        for (const key in source) {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (!target[key]) target[key] = {};
            mergeTheme(target[key], source[key]);
          } else {
            target[key] = source[key];
          }
        }
      };

      mergeTheme(baseTheme, presetData);
      this.theme = baseTheme;

      // Update color mode if specified in preset
      if (presetData.colorMode) {
        this.editorState.colorMode = presetData.colorMode;
      }

      // Update the preview
      this.updatePreview();
    },

    // Sample HTML generation
    getSampleHTML() {
      if (this.theme.content.source === 'lorem') {
        return this.getLoremHTML();
      } else if (this.editorState.wiki.content) {
        return this.getWikiHTML();
      } else {
        return this.getDefaultHTML();
      }
    },

    getLoremHTML() {
      const { loremParagraphs, loremImages, loremHeadings } = this.theme.content;

      // If we haven't generated lorem text yet, do it now
      if (!this.editorState.loremTextCache) {
        this.generateLoremTextCache();
      }

      const heroPanel = this.theme.hero.enabled ?
        `<div class="hero-panel">
          <h1 class="post-title">Black Quartz</h1>
        </div>` : '';

      let content = '';
      content += !this.theme.hero.enabled ? '<h1 class="post-title">Black Quartz</h1>' : '';

      // Generate lorem paragraphs interspersed with headings and images
      const paragraphsPerSection = Math.ceil(loremParagraphs / loremHeadings);
      const imagesPerSection = Math.ceil(loremImages / loremHeadings);

      // Add first paragraph (special)
      content += `<p>${this.editorState.loremTextCache[0]}</p>\n`;

      for (let i = 0; i < loremHeadings; i++) {
        if (i > 0) {
          content += '<hr>\n';
        }

        content += `<h2>Section Heading ${i + 1}</h2>\n`;

        // Add paragraphs and images for this section
        for (let p = 0; p < paragraphsPerSection; p++) {
          if (p % 2 === 0 && p < imagesPerSection) {
            // Add an image with different alignments
            const width = 600 + (i * 100) % 300;
            const height = 300 + (p * 50) % 200;
            const seed = i * 10 + p;

            // Alternate between left, right, and full alignment
            const alignment = p % 3 === 0 ? 'left' : p % 3 === 1 ? 'right' : 'full';
            content += this.getImageHTML(width, height, seed, null, alignment);
          }

          // Use cached lorem text
          const paraIndex = i * paragraphsPerSection + p + 1; // +1 because we used index 0 already
          if (paraIndex < this.editorState.loremTextCache.length) {
            content += `<p>${this.editorState.loremTextCache[paraIndex]}</p>\n`;
          }

          // Add a subheading halfway through
          if (p === Math.floor(paragraphsPerSection / 2) && paragraphsPerSection > 2) {
            content += `<h3>Subsection ${i + 1}.${p + 1}</h3>\n`;
          }
        }
      }

      content += `<p>Some text with a <a href="#">link</a> to demonstrate link styling. And <a href="#">another link</a> for good measure.</p>`;

      // Add style examples
      content += `<h2>Style Examples</h2>\n`;
      content += `
        <blockquote>
          ${this.editorState.loremTextCache[Math.floor(Math.random() * this.editorState.loremTextCache.length)]}
        </blockquote>
        
        <table>
          <thead>
            <tr>
              <th>Header 1</th>
              <th>Header 2</th>
              <th>Header 3</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Data 1A</td>
              <td>Data 1B</td>
              <td>Data 1C</td>
            </tr>
            <tr>
              <td>Data 2A</td>
              <td>Data 2B</td>
              <td>Data 2C</td>
            </tr>
            <tr>
              <td>Data 3A</td>
              <td>Data 3B</td>
              <td>Data 3C</td>
            </tr>
          </tbody>
        </table>
        
        <h3>Unordered List</h3>
        <ul>
          <li>First item in the list</li>
          <li>Second item in the list</li>
          <li>Third item with a <a href="#">link</a> inside</li>
          <li>Fourth and final item</li>
        </ul>
        
        <h3>Ordered List</h3>
        <ol>
          <li>First numbered item</li>
          <li>Second numbered item</li>
          <li>Third numbered item</li>
        </ol>
      `;

      content += '<h2>Related Articles</h2>\n';
      content += this.getImageLinksHTML();

      return `
        <div class="page-container">
          ${heroPanel}
          <div class="content">
            ${content}
          </div>
        </div>
      `;
    },

    getWikiHTML() {
      if (!this.editorState.wiki.content) return this.getDefaultHTML();

      const { title, extract, thumbnail, sections } = this.editorState.wiki.content;

      const heroPanel = this.theme.hero.enabled ?
        `<div class="hero-panel">
          <h1 class="post-title">${title}</h1>
        </div>` : '';

      let content = '';
      content += !this.theme.hero.enabled ? `<h1 class="post-title">${title}</h1>` : '';

      // Add a custom lead-in before the extract
      content += "<p>Sphinx of black quartz, judge my vow!</p> ";

      // Add intro paragraph
      content += `<p>${extract}</p>\n`;

      // Add first image if available
      if (thumbnail) {
        content += this.getImageHTML(thumbnail, 800, 400, 1, `${title} thumbnail`);
      } else {
        // Placeholder
        content += this.getImageHTML(800, 400, 1, `${title} illustration`);
      }

      // Add sections
      if (sections && sections.length) {
        sections.forEach((section, i) => {
          if (i > 0) {
            content += '<hr>\n';
          }

          // Add section heading if it's not empty or "See also", "References", etc.
          if (section.heading && !['See also', 'References', 'External links', 'Notes', 'Bibliography'].includes(section.heading)) {
            content += `<h2>${section.heading}</h2>\n`;

            // Add section text if available
            if (section.content) {
              // For security, extract just text content
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = section.content;
              const text = tempDiv.textContent || tempDiv.innerText || '';

              if (text.length > 100) {
                content += `<p>${text.substring(0, 300)}...</p>\n`;
              } else {
                content += `<p>${this.getLoremText()}</p>\n`;
              }
            } else {
              // Placeholder text
              content += `<p>${this.getLoremText()}</p>\n`;
            }

            // Add image for some sections
            if (i % 2 === 0) {
              content += this.getImageHTML(700, 350, i + 2, `Illustration related to ${section.heading}`);
            }
          }
        });
      }

      content += `<p>Some text with a <a href="#">link</a> to demonstrate link styling. And <a href="#">another link</a> for good measure.</p>`;

      // Add sample content to show styling
      content += '<h2>Related Articles</h2>\n';
      content += this.getImageLinksHTML();

      return `
        <div class="page-container">
          ${heroPanel}
          <div class="content">
            ${content}
          </div>
        </div>
      `;
    },

    getDefaultHTML() {
      // Default content shown when no content source is selected
      const heroPanel = this.theme.hero.enabled ?
        `<div class="hero-panel">
          <h1 class="post-title">BlackQuartz 2.0 Theme Designer</h1>
        </div>` : '';

      return `
        <div class="page-container">
          ${heroPanel}
          <div class="content">
            ${!this.theme.hero.enabled ? '<h1 class="post-title">BlackQuartz 2.0 Theme Designer</h1>' : ''}
            <p>Select a content source in the Content tab to show preview content.</p>
            <p>You can choose between Lorem Ipsum text or search for a Wikipedia article.</p>
            <p>This demo shows all the styling capabilities of your theme. The changes you make in the Design tab will be reflected here.</p>
            
            <h2>Style Examples</h2>
            <p>Here are some basic style examples to get you started:</p>
            
            <h3>Typography</h3>
            <p>This is a paragraph with <a href="#">a sample link</a> to demonstrate link styling.</p>
            
            <h3>Table Example</h3>
            <table>
              <thead>
                <tr>
                  <th>Header 1</th>
                  <th>Header 2</th>
                  <th>Header 3</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Data 1A</td>
                  <td>Data 1B</td>
                  <td>Data 1C</td>
                </tr>
                <tr>
                  <td>Data 2A</td>
                  <td>Data 2B</td>
                  <td>Data 2C</td>
                </tr>
              </tbody>
            </table>
            
            <h3>Lists</h3>
            <ul>
              <li>Unordered list item 1</li>
              <li>Unordered list item 2</li>
              <li>Unordered list item with a <a href="#">link</a></li>
            </ul>
            
            <h3>Blockquote</h3>
            <blockquote>
              This is a blockquote. It can be used to highlight important information or quotes from other sources.
            </blockquote>
            
            <h3>Image Example</h3>
            ${this.getImageHTML(800, 400, 1, "Example image")}
          </div>
        </div>
      `;
    },

    // Helper to generate image HTML with alignment options
    getImageHTML(widthOrUrl, height, seed, caption, alignment = 'full') {
      // Handle different types of parameters
      let imgUrl;
      if (typeof widthOrUrl === 'string' && widthOrUrl.startsWith('http')) {
        // It's already a URL
        imgUrl = widthOrUrl;
      } else {
        // It's a width, so construct a URL
        const width = widthOrUrl;
        imgUrl = `https://picsum.photos/${width}/${height}?random=${seed}`;
      }

      caption = caption || `Image caption ${seed}`;

      // Generate class based on alignment
      const alignClass = alignment === 'full' ? 'image-full' :
        alignment === 'left' ? 'image-left' :
          alignment === 'right' ? 'image-right' : 'image-full';

      return `
        <div class="image-container ${alignClass}">
          <img src="${imgUrl}" alt="Sample image ${seed}">
          <div class="image-caption">${caption}</div>
        </div>
      `;
    },

    // Generate image links HTML
    getImageLinksHTML() {
      // Get demo link data
      const links = this.getImageLinkItems();

      // Get theme settings
      const { layout, displayStyle } = this.theme.imageLinks;
      const isCarousel = layout === 'carousel';

      // Generate the appropriate HTML based on layout
      if (isCarousel) {
        return this.generateCarouselHTML(links);
      } else {
        return this.generateStandardLayoutHTML(links, displayStyle);
      }
    },

    // Sample image links data
    getImageLinkItems() {
      return [
        { url: '#post1', image: 'https://picsum.photos/400/250?random=101', title: 'Getting Started with CSS', id: 'item1' },
        { url: '#post2', image: 'https://picsum.photos/400/350?random=102', title: 'Advanced Typography Techniques', id: 'item2' },
        { url: '#post3', image: 'https://picsum.photos/400/200?random=103', title: 'Responsive Design Principles', id: 'item3' },
        { url: '#post4', image: 'https://picsum.photos/400/300?random=104', title: 'Color Theory for Web Designers', id: 'item4' },
        { url: '#post5', image: 'https://picsum.photos/400/280?random=105', title: 'Web Performance Optimization', id: 'item5' }
      ];
    },

    // Generate standard grid or list layout HTML
    generateStandardLayoutHTML(links, displayStyle) {
      const html = `<div class="image-link-block${displayStyle === 'masonry' ? ' masonry-grid' : ''}">\n`;
      const linksHtml = this.generateLinkItemsHTML(links);

      return html + linksHtml + '</div>\n';
    },

    // Generate carousel layout HTML with optional controls
    generateCarouselHTML(links) {
      const { carousel } = this.theme.imageLinks;
      const showArrows = carousel?.showArrows || false;
      const showDots = carousel?.showDots || false;
      const autoScroll = carousel?.autoScroll || false;

      let html = '<div class="carousel-container">\n';

      // Main carousel container
      html += `  <div id="image-carousel" class="image-link-block carousel${autoScroll ? ' auto-scroll' : ''}">\n`;
      html += this.generateLinkItemsHTML(links);
      html += '  </div>\n';

      // Add navigation controls if enabled
      if (showArrows) {
        html += this.generateCarouselArrowsHTML(links);
      }

      if (showDots) {
        html += this.generateCarouselDotsHTML(links);
      }

      html += '</div>\n';

      // Add optional JavaScript for enhanced navigation
      if (showArrows || showDots) {
        html += this.generateCarouselJavaScript(showArrows, showDots);
      }

      return html;
    },

    // Generate HTML for each link item
    generateLinkItemsHTML(links) {
      let html = '';

      for (const link of links) {
        html += `  <a href="${link.url}" class="image-link" id="${link.id}">\n`;
        html += `    <div class="image-link-inner">\n`;

        // Image
        html += `      <img src="${link.image}" alt="${link.title}">\n`;

        // Caption
        html += `      <div class="image-link-caption">${link.title}</div>\n`;

        html += `    </div>\n`;
        html += `  </a>\n`;
      }

      return html;
    },

    generateCarouselArrowsHTML(links) {
      // Use first and last item IDs for navigation
      const firstItemId = links[0].id;
      const lastItemId = links[links.length - 1].id;

      return `  <a href="#${firstItemId}" class="carousel-arrow carousel-arrow-left">❮</a>\n` +
        `  <a href="#${lastItemId}" class="carousel-arrow carousel-arrow-right">❯</a>\n`;
    },

    generateCarouselDotsHTML(links) {
      let html = '  <div class="carousel-dots">\n';

      links.forEach(link => {
        html += `    <div class="carousel-dot"><a href="#${link.id}"></a></div>\n`;
      });

      html += '  </div>\n';
      return html;
    },

    generateCarouselJavaScript(showArrows, showDots) {
      let js = '<script>\n';
      js += '  // Minimal JavaScript for carousel navigation\n';
      js += '  document.addEventListener("DOMContentLoaded", function() {\n';
      js += '    const carousel = document.getElementById("image-carousel");\n';
      js += '    const items = carousel.querySelectorAll(".image-link");\n';
      js += '    let currentIndex = 0;\n\n';

      // Arrow navigation
      if (showArrows) {
        js += this.generateArrowNavigationJS();
      }

      // Dot navigation
      if (showDots) {
        js += this.generateDotNavigationJS();
      }

      js += '  }); </' + 'script> \n ';
      return js;
    },

    // Generate JavaScript for arrow navigation
    generateArrowNavigationJS() {
      return ' const prevBtn = document.querySelector(".carousel-arrow-left");\n' +
        ' const nextBtn = document.querySelector(".carousel-arrow-right");\n\n' +
        ' if (prevBtn) {\n' +
        ' prevBtn.addEventListener("click", function(e) {\n' +
        ' e.preventDefault();\n' +
        ' currentIndex = (currentIndex > 0) ? currentIndex - 1 : items.length - 1;\n' +
        ' items[currentIndex].scrollIntoView({ behavior: "smooth", inline: "start" });\n' +
        ' });\n' +
        ' }\n\n' +
        ' if (nextBtn) {\n' +
        ' nextBtn.addEventListener("click", function(e) {\n' +
        ' e.preventDefault();\n' +
        ' currentIndex = (currentIndex < items.length - 1) ? currentIndex + 1 : 0;\n' +
        '        items[currentIndex].scrollIntoView({ behavior: "smooth", inline: "start" });\n' +
        '      });\n' +
        '    }\n';
    },

    // Generate JavaScript for dot navigation 
    generateDotNavigationJS() {
      return '    const dots = document.querySelectorAll(".carousel-dot a");\n'
        + '    dots.forEach(function(dot, index) {\n' + '      dot.addEventListener("click", function(e) {\n'
        + '        e.preventDefault();\n' + '        currentIndex = index;\n'
        + '        items[index].scrollIntoView({ behavior: "smooth", inline: "start" });\n' + '      });\n'
        + '    });\n';
    },

    // Update preview iframe 
    updatePreview() {
      this.editorState.isLoading = true; 
      
      // Ensure lorem text is generated if needed 
      if (this.theme.content.source === 'lorem' && !this.editorState.loremTextCache) {
        this.generateLoremTextCache();
      }
      
      // Generate sample HTML 
      const htmlContent = this.getSampleHTML(); 
      
      // Generate CSS
      const cssCode = this.css; 
      
      // Update the preview frame 
      this.$nextTick(() => {
        this.$refs.preview.updatePreview(cssCode, htmlContent);
        this.editorState.isLoading = false;
      });
    },

    handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.exportCSS();
      }
    }
  }
};
</script>