<!-- src/components/controls/ColorControl.vue -->
<template>
  <div class="control-color">
    <label class="block mb-2 text-sm font-medium text-gray-700">{{ label }}</label>
    <div class="flex items-center gap-3">
      <input 
        type="color"
        :value="modelValue"
        @input="handleInput"
        @change="handleChange" 
        class="w-12 h-8 p-0 border-0 rounded cursor-pointer"
      >
      <span class="text-sm bg-gray-100 px-2 py-1 rounded">
        {{ modelValue || '#000000' }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ColorControl',
  props: {
    modelValue: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    }
  },
  methods: {
    handleInput(event) {
      // Just update the value during input
      const value = event.target.value;
      this.$emit('update:modelValue', value);
    },
    handleChange(event) {
      // Record the change only when the color picker is closed
      const value = event.target.value;
      this.$emit('change', {
        value,
        action: `change ${this.label.toLowerCase()} color`
      });
    }
  }
}
</script>