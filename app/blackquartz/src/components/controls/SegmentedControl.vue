<template>
    <div class="segmented-control">
      <template v-for="(option, index) in options" :key="index">
        <input 
          type="radio" 
          :id="'segment-' + id + '-' + index" 
          :value="option.value" 
          v-model="internalValue" 
          @change="updateValue"
        >
        <label :for="'segment-' + id + '-' + index">{{ option.label }}</label>
      </template>
    </div>
  </template>
  
  <script>
  export default {
    name: 'SegmentedControl',
    props: {
      modelValue: { required: true },
      options: { type: Array, required: true }
    },
    emits: ['update:modelValue'],
    data() {
      return {
        internalValue: this.modelValue,
        id: 'seg-' + Math.floor(Math.random() * 10000)
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
  