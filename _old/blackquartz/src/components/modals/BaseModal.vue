<!-- src/components/modals/BaseModal.vue -->
<template>
    <Teleport to="body">
      <div 
        v-if="modelValue"
        class="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center"
        @click.self="$emit('update:modelValue', false)"
      >
        <div class="bg-white p-6 rounded-xl shadow-2xl max-w-lg w-full mx-4">
          <h2 class="text-xl font-bold mb-4">{{ title }}</h2>
          <div class="modal-content">
            <slot></slot>
          </div>
          <div class="mt-6 flex justify-end gap-2">
            <slot name="actions">
              <button 
                @click="$emit('update:modelValue', false)"
                class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Close
              </button>
            </slot>
          </div>
        </div>
      </div>
    </Teleport>
  </template>
  
  <script>
  export default {
    name: 'BaseModal',
    props: {
      modelValue: {
        type: Boolean,
        required: true
      },
      title: {
        type: String,
        required: true
      }
    }
  }
  </script>