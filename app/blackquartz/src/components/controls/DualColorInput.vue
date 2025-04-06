<template>
    <div class="dual-color-input">
      <div class="dual-color-row">
        <label v-if="label">{{ label }}</label>
        <input 
          type="color" 
          v-model="dualColor.light" 
          @input="updateColor" 
          :class="{ active: colorMode === 'light' }"
        >
        <input 
          type="text" 
          v-model="dualColor.light" 
          @input="updateColor"
          :class="{ active: colorMode === 'light' }"
        >
        <span class="link-both" :class="{ linked: colorLinked }" @click="toggleColorLink" title="Link/unlink light and dark colors">
          <i class="fas" :class="colorLinked ? 'fa-link' : 'fa-unlink'"></i>
        </span>
      </div>
      <div class="dual-color-row" v-if="showDarkMode">
        <label v-if="label"></label>
        <input 
          type="color" 
          v-model="dualColor.dark" 
          :disabled="colorLinked" 
          @input="updateColor"
          :class="{ active: colorMode === 'dark' }"
        >
        <input 
          type="text" 
          v-model="dualColor.dark" 
          :disabled="colorLinked" 
          @input="updateColor"
          :class="{ active: colorMode === 'dark' }"
        >
      </div>
    </div>
  </template>
  
  <script>
  import ThemeUtils from '../../services/ThemeUtils';
  
  export default {
    name: 'DualColorInput',
    props: {
      modelValue: { required: true },
      label: String,
      colorMode: { type: String, default: 'light' }
    },
    emits: ['update:modelValue', 'edit'],
    data() {
      return {
        dualColor: this.initDualColor(),
        colorLinked: true,
        showDarkMode: false
      };
    },
    watch: {
      modelValue: {
        handler(newValue) {
          this.dualColor = this.initDualColor();
        },
        deep: true
      }
    },
    methods: {
      initDualColor() {
        // Convert to dual color format if needed
        if (typeof this.modelValue === 'string') {
          return {
            light: this.modelValue,
            dark: ThemeUtils.invertColor(this.modelValue)
          };
        } else if (this.modelValue && typeof this.modelValue === 'object') {
          return {
            light: this.modelValue.light || '#000000',
            dark: this.modelValue.dark || '#ffffff'
          };
        }
        return { light: '#000000', dark: '#ffffff' };
      },
  
      updateColor() {
        // If colors are linked, update dark color based on light
        if (this.colorLinked) {
          this.dualColor.dark = ThemeUtils.invertColor(this.dualColor.light);
        }
        // Emit the updated dual color
        this.$emit('update:modelValue', this.dualColor);
      },
  
      toggleColorLink() {
        this.colorLinked = !this.colorLinked;
        this.showDarkMode = !this.colorLinked;
        if (this.colorLinked) {
          this.dualColor.dark = ThemeUtils.invertColor(this.dualColor.light);
          this.updateColor();
        }
      }
    }
  };
  </script>
  