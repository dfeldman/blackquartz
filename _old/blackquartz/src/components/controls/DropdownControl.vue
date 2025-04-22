<!-- src/components/controls/DropdownControl.vue -->
<template>
  <div class="control-dropdown">
    <label class="block mb-2 text-sm font-medium text-gray-700">{{ label }}</label>
    <select 
      :value="modelValue"
      @input="handleInput"
      @change="handleChange"  
      class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
    >
      <option 
        v-for="option in options" 
        :key="option.value" 
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'DropdownControl',
  props: {
    modelValue: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    options: {
      type: Array,
      required: true,
      validator: (options) => options.every(option => 
        'value' in option && 'label' in option
      )
    }
  },
  methods: {
    handleInput(event) {
      // Just update the value
      const value = event.target.value;
      this.$emit('update:modelValue', value);
    },
    handleChange(event) {
      // Record the change only when selection is complete
      const value = event.target.value;
      this.$emit('change', {
        value,
        action: `change ${this.label.toLowerCase()}`
      });
    }
  }
}
</script>