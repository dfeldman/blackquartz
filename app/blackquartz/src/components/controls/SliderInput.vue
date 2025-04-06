<template>
    <div>
      <label v-if="label">{{ label }}</label>
      <div class="range-with-value">
        <input 
          type="range" 
          :min="min" 
          :max="max" 
          :step="step" 
          v-model.number="internalValue" 
          @input="updateValue"
        >
        <span>{{ internalValue }}{{ unit }}</span>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'SliderInput',
    props: {
      modelValue: { type: Number, required: true },
      min: { type: Number, default: 0 },
      max: { type: Number, default: 100 },
      step: { type: Number, default: 1 },
      label: String,
      unit: { type: String, default: '' }
    },
    emits: ['update:modelValue'],
    data() {
      return {
        internalValue: this.modelValue
      };
    },
    watch: {
      modelValue(newValue) {
        this.internalValue = newValue;
      }
    },
    methods: {
      updateValue() {
        this.$emit('update:modelValue', this.internalValue);
      }
    }
  };
  </script>
  