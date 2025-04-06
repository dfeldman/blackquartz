<template>
    <label class="checkbox-label">
      <input type="checkbox" v-model="internalValue" @change="updateValue">
      {{ label }}
    </label>
  </template>
  
  <script>
  export default {
    name: 'CheckboxInput',
    props: {
      modelValue: { type: Boolean, required: true },
      label: { type: String, required: true }
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