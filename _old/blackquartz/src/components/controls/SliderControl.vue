<!-- src/components/controls/SliderControl.vue -->
<template>
  <div class="control-slider">
    <label class="block mb-2 text-sm font-medium text-gray-700">{{ label }}</label>
    <div class="flex items-center gap-3">
      <input 
        type="range"
        :value="scaledValue"
        :min="computedMin"
        :max="computedMax"
        :step="1"
        @input="handleInput"
        @change="handleChange"  
        class="flex-1 h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
      >
      <span class="text-sm bg-gray-100 px-2 py-1 rounded min-w-[3.5rem] text-center">
        {{ formattedValue }}{{ units }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SliderControl',
  props: {
    modelValue: {
      type: Number,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    },
    units: {
      type: String,
      default: ''
    },
    resolution: {
      type: Number,
      default: 1
    }
  },
  computed: {
    computedMin() {
      return Math.round(this.min * (1/this.resolution));
    },
    computedMax() {
      return Math.round(this.max * (1/this.resolution));
    },
    scaledValue() {
      return Math.round(this.modelValue * (1/this.resolution));
    },
    formattedValue() {
      const decimalPlaces = Math.max(0, -Math.floor(Math.log10(this.resolution)));
      return this.modelValue.toFixed(decimalPlaces);
    }
  },
  methods: {
    handleInput(event) {
      // Just update the value during input, don't record the change
      const rawValue = Number(event.target.value);
      const scaledValue = rawValue * this.resolution;
      this.$emit('update:modelValue', scaledValue);
    },
    handleChange(event) {
      // Record the change only when the user is done dragging
      console.log('handleChange');
      const rawValue = Number(event.target.value);
      const scaledValue = rawValue * this.resolution;
      this.$emit('change', { 
        value: scaledValue,
        action: `adjust ${this.label.toLowerCase()}`
      });
    }
  }
}
</script>