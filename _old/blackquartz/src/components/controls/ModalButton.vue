<!-- src/components/controls/ModalButton.vue -->
<template>
    <div class="control-modal-button">
      <label class="block mb-2 text-sm font-medium text-gray-700">{{ label }}</label>
      <button 
        @click="$emit('click')"
        class="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
      >
        Select {{ label }}
      </button>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ModalButton',
    props: {
      label: {
        type: String,
        required: true
      }
    }
  }
  </script>