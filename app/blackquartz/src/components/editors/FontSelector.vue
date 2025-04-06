<template>
    <div class="background-editor-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Font Selector - {{ target === 'body' ? 'Body Text' : 'Headings' }}</h3>
          <button class="close-btn" @click="$emit('close')">×</button>
        </div>
        
        <div class="modal-body">
          <div class="font-selector-tabs">
            <div 
              :class="['font-selector-tab', tab === 'popular' ? 'active' : '']" 
              @click="$emit('set-tab', 'popular')"
            >Popular Fonts</div>
            <div 
              :class="['font-selector-tab', tab === 'all' ? 'active' : '']" 
              @click="$emit('set-tab', 'all')"
            >All Fonts</div>
            <div 
              :class="['font-selector-tab', tab === 'pairings' ? 'active' : '']" 
              @click="$emit('set-tab', 'pairings')"
            >Font Pairings</div>
          </div>
          
          <h4>Preview</h4>
          <div class="font-preview-container" :style="{ fontFamily: fontFamily }">
            <div :style="{ fontSize: '24px', marginBottom: '10px' }">
              The quick brown fox jumps over the lazy dog
            </div>
            <div>
              ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>
              abcdefghijklmnopqrstuvwxyz<br>
              0123456789!@#$%^&*()
            </div>
          </div>
          
          <div :class="['font-selector-content', tab === 'popular' ? 'active' : '']">
            <div class="font-search">
              <i class="fas fa-search"></i>
              <input type="text" v-model="searchText" @input="onSearchInput" placeholder="Search fonts...">
            </div>
            
            <div class="font-grid">
              <div 
                v-for="font in filteredPopularFonts" 
                :key="font.family"
                :class="['font-grid-item', fontFamily === `'${font.family}', ${font.category}` ? 'selected' : '']"
                :style="{ fontFamily: `'${font.family}', ${font.category}` }"
                @click="onFontClick(font)"
              >
                <div>{{ font.family }}</div>
                <div style="font-size: 12px; color: #666;">{{ font.category }}</div>
              </div>
            </div>
          </div>
          
          <div :class="['font-selector-content', tab === 'all' ? 'active' : '']">
            <!-- All fonts content would go here -->
          </div>
          
          <div :class="['font-selector-content', tab === 'pairings' ? 'active' : '']">
            <div 
              v-for="pairing in fontPairings" 
              :key="pairing.name" 
              class="font-pairing" 
              @click="onPairingClick(pairing)"
            >
              <h4>{{ pairing.name }}</h4>
              <p>{{ pairing.description }}</p>
              <div class="font-pairing-preview">
                <div class="font-pairing-title" :style="{ fontFamily: pairing.heading }">Heading Font</div>
                <div class="font-pairing-body" :style="{ fontFamily: pairing.body }">Body text sample</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn cancel" @click="$emit('close')">Cancel</button>
          <button class="btn save" @click="$emit('save')">Apply Font</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { CONSTANTS } from '../../constants';
  
  export default {
    name: 'FontSelector',
    props: {
      fontFamily: { type: String, required: true },
      target: { type: String, required: true },
      tab: { type: String, default: 'popular' },
      search: { type: String, default: '' }
    },
    emits: ['save', 'close', 'set-tab', 'set-search', 'select-font', 'select-pairing'],
    data() {
      return {
        searchText: this.search,
        fontPairings: CONSTANTS.FONT_PAIRINGS,
        googleFonts: CONSTANTS.GOOGLE_FONTS
      };
    },
    computed: {
      filteredPopularFonts() {
        const popularFonts = this.googleFonts.slice(0, 20);
        if (!this.searchText) return popularFonts;
  
        const searchLower = this.searchText.toLowerCase();
        return popularFonts.filter(font =>
          font.family.toLowerCase().includes(searchLower)
        );
      }
    },
    methods: {
      onSearchInput() {
        this.$emit('set-search', this.searchText);
      },
      onFontClick(font) {
        this.$emit('select-font', font);
      },
      onPairingClick(pairing) {
        this.$emit('select-pairing', pairing);
      }
    }
  };
  </script>