<template>
    <div class="controls">
      <div class="controls-header">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <h2><span style="color:#333">Black</span><span style="color:#2271b1">Quartz</span> <span style="font-size:14px;color:#666">2.0</span></h2>
          <div class="mode-switch">
            <span class="mode-icon"><i class="fas fa-sun"></i></span>
            <label class="mode-switch-label">
              <input type="checkbox" class="mode-switch-input" :checked="editorState.colorMode === 'dark'" @change="toggleDarkMode">
              <span class="mode-switch-slider"></span>
            </label>
            <span class="mode-icon"><i class="fas fa-moon"></i></span>
          </div>
        </div>
        
        <div class="tabs">
          <div 
            :class="['tab', editorState.activeTab === 'content' ? 'active' : '']" 
            @click="editorState.activeTab = 'content'"
          >Content</div>
          <div 
            :class="['tab', editorState.activeTab === 'design' ? 'active' : '']" 
            @click="editorState.activeTab = 'design'"
          >Design</div>
          <div 
            :class="['tab', editorState.activeTab === 'export' ? 'active' : '']" 
            @click="editorState.activeTab = 'export'"
          >Import/Export</div>
        </div>
      </div>
      
      <!-- Content Tab -->
      <div :class="['tab-content', editorState.activeTab === 'content' ? 'active' : '']">
        <responsive-preview-control 
          :responsive-preview="theme.responsivePreview"
        ></responsive-preview-control>
        
        <content-source-control 
          :content="theme.content"
          :wiki-state="editorState.wiki"
          @generate-lorem="onGenerateNewLorem"
          @search-wiki="onSearchWikipedia"
          @select-wiki="onSelectWikiArticle"
          @fetch-wiki="onFetchWikiArticleContent"
        ></content-source-control>
      </div>
      
      <!-- Design Tab -->
      <div :class="['tab-content', editorState.activeTab === 'design' ? 'active' : '']">
        <design-controls 
          :theme="theme"
          :editor-state="editorState"
          :collapsed-groups="editorState.collapsedGroups"
          @toggle-group="onToggleGroup"
          @open-background="onOpenBackgroundEditor"
          @open-font="onOpenFontSelector"
          @open-color="onOpenColorPicker"
          @open-color-theme="onOpenColorThemeEditor"
        ></design-controls>
      </div>
      
      <!-- Export Tab -->
      <div :class="['tab-content', editorState.activeTab === 'export' ? 'active' : '']">
        <export-controls 
          :theme="theme"
          @export-css="onExportCSS"
          @export-html="onExportHTML"
          @copy-css="onCopyCSS"
          @export-json="onExportThemeJSON"
          @import-json="onImportThemeJSON"
          @apply-preset="onApplyPreset"
        ></export-controls>
      </div>
      
      <div class="controls-footer">
        <button class="export-button" @click="refreshPreview">
          <i class="fas fa-refresh"></i> Refresh Preview
        </button>
      </div>
    </div>
  </template>
  
  <script>
  import ResponsivePreviewControl from './ResponsivePreviewControl.vue';
  import ContentSourceControl from './ContentSourceControl.vue';
  import DesignControls from './DesignControls.vue';
  import ExportControls from './ExportControls.vue';
  
  export default {
    name: 'EditorControls',
    components: {
      ResponsivePreviewControl,
      ContentSourceControl,
      DesignControls,
      ExportControls
    },
    props: {
      theme: { type: Object, required: true },
      editorState: { type: Object, required: true },
      isLoading: { type: Boolean, default: false }
    },
    emits: [
      'update-preview',
      'toggle-dark-mode',
      'toggle-group',
      'generate-new-lorem',
      'search-wikipedia',
      'select-wiki-article',
      'fetch-wiki-article',
      'open-background-editor',
      'open-font-selector',
      'open-color-picker',
      'open-color-theme', // Add this
      'export-css',
      'export-html',
      'copy-css',
      'export-theme-json',
      'import-theme-json',
      'apply-preset'
    ],
    methods: {
      refreshPreview() {
        this.$emit('update-preview');
      },
      toggleDarkMode() {
        this.$emit('toggle-dark-mode');
      },
      onToggleGroup(group) {
        this.$emit('toggle-group', group);
      },
      onGenerateNewLorem() {
        this.$emit('generate-new-lorem');
      },
      onSearchWikipedia(query) {
        this.$emit('search-wikipedia', query);
      },
      onSelectWikiArticle(article) {
        this.$emit('select-wiki-article', article);
      },
      onFetchWikiArticleContent() {
        this.$emit('fetch-wiki-article');
      },
      onOpenBackgroundEditor(target) {
        this.$emit('open-background-editor', target);
      },
      onOpenFontSelector(target) {
        this.$emit('open-font-selector', target);
      },
      onOpenColorPicker(target) {
        this.$emit('open-color-picker', target);
      },
      onExportCSS() {
        this.$emit('export-css');
      },
      onExportHTML() {
        this.$emit('export-html');
      },
      onCopyCSS() {
        this.$emit('copy-css');
      },
      onExportThemeJSON() {
        this.$emit('export-theme-json');
      },
      onImportThemeJSON() {
        this.$emit('import-theme-json');
      },
      onApplyPreset(preset) {
        this.$emit('apply-preset', preset);
      },
      onOpenColorThemeEditor() {
        this.$emit('open-color-theme');
    },
    }
  };
  </script>
