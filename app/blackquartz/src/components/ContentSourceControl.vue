<template>
  <div class="control-group" :class="{ collapsed: collapsed }">
    <h3 @click="toggleCollapsed">
      <span class="toggle-icon"></span>Content Source
    </h3>
    <div class="control-content" v-show="!collapsed">
      <div class="tabs">
        <div 
          :class="['tab', content.source === 'lorem' ? 'active' : '']" 
          @click="setContentSource('lorem')"
        >Lorem Ipsum</div>
        <div 
          :class="['tab', content.source === 'wiki' ? 'active' : '']" 
          @click="setContentSource('wiki')"
        >Wikipedia</div>
      </div>
      
      <div v-if="content.source === 'lorem'">
        <slider-input 
          label="Paragraphs" 
          v-model="content.loremParagraphs" 
          :min="3" 
          :max="15"
        ></slider-input>
        
        <slider-input 
          label="Images" 
          v-model="content.loremImages" 
          :min="2" 
          :max="8"
        ></slider-input>
        
        <slider-input 
          label="Headings" 
          v-model="content.loremHeadings" 
          :min="2" 
          :max="6"
        ></slider-input>
        
        <button @click="$emit('generate-lorem')">Regenerate Lorem Text</button>
      </div>
      
      <div v-if="content.source === 'wiki'">
        <label>Search Wikipedia</label>
        <div class="font-search">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            v-model="wikiSearch" 
            @input="onWikiSearchInput"
            placeholder="Search for an article..."
          >
        </div>
        
        <div v-if="wikiState.searching" class="loading" style="position:relative; height:50px;">
          <div class="spinner"></div>
        </div>
        
        <div v-if="wikiState.error" class="message error">
          {{ wikiState.error }}
        </div>
        
        <div :class="['wiki-search-results', wikiState.results.length > 0 ? 'active' : '']">
          <div 
            v-for="result in wikiState.results" 
            :key="result.pageid" 
            class="wiki-result-item"
            @click="onWikiResultClick(result)"
          >
            <div class="wiki-result-title" v-html="result.title"></div>
            <div class="wiki-result-snippet" v-html="result.snippet"></div>
          </div>
        </div>
        
        <div v-if="wikiState.currentArticle">
          <div class="message success">
            <strong>Selected Article:</strong> {{ wikiState.currentArticle.title }}
          </div>
          <button @click="$emit('fetch-wiki')">Load Article Content</button>
        </div>
      </div>
    </div>
</div>
</template>

<script>
import SliderInput from './controls/SliderInput.vue';

export default {
  name: 'ContentSourceControl',
  components: {
    SliderInput
  },
  props: {
    content: { type: Object, required: true },
    wikiState: { type: Object, required: true }
  },
  emits: ['generate-lorem', 'search-wiki', 'select-wiki', 'fetch-wiki'],
  data() {
    return {
      collapsed: false,
      wikiSearch: ''
    };
  },
  methods: {
    toggleCollapsed() {
      this.collapsed = !this.collapsed;
    },
    setContentSource(source) {
      this.content.source = source;
    },
    onWikiSearchInput() {
      // Debounced wiki search
      this.$emit('search-wiki', this.wikiSearch);
    },
    onWikiResultClick(result) {
      this.$emit('select-wiki', result);
    }
  }
};
</script>