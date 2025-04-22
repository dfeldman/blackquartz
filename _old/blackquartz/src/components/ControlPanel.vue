<!-- src/components/ControlPanel.vue -->
<template>
    <div class="control-panel">
      <h1 class="text-2xl font-bold mb-6 text-gray-800">Style Sheet Maker</h1>
      
      <!-- Action Buttons -->
      <div class="space-y-4 mb-8">
        <div class="flex gap-2">
          <button 
            @click="settings.undo" 
            :disabled="!canUndo"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1"
          >
            <span class="block text-sm">Undo</span>
            <span class="block text-xs opacity-75">{{ lastUndoAction }}</span>
          </button>
          <button 
            @click="settings.redo" 
            :disabled="!canRedo"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1"
          >
            <span class="block text-sm">Redo</span>
            <span class="block text-xs opacity-75">{{ nextRedoAction }}</span>
          </button>
        </div>
  
        <div class="flex gap-2">
          <button 
            @click="exportToFile"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 transition-colors flex-1"
          >
            Export
          </button>
          <button 
            @click="generatePermalink"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 transition-colors flex-1"
          >
            Permalink
          </button>
          <input 
            type="file" 
            ref="fileInput" 
            @change="importFromFile" 
            class="hidden"
            accept=".json"
          >
          <button 
            @click="$refs.fileInput.click()"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 transition-colors flex-1"
          >
            Import
          </button>
        </div>
      </div>
  
      <!-- Controls -->
      <div class="space-y-8">
        <div 
          v-for="category in groupedControls" 
          :key="category.name" 
          class="bg-gray-50 p-4 rounded-lg"
        >
          <h2 class="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
            {{ category.name }}
          </h2>
          <div class="space-y-4">
            <template v-for="control in category.controls" :key="control.id">
              <!-- Slider Control -->
              <SliderControl
                v-if="control.type === 'slider'"
                v-model="settings.currentSettings[control.id]"
                :label="control.name"
                :min="control.min"
                :max="control.max"
                :units="control.units"
                :resolution="control.resolution"
                @change="handleChange"
              />
  
              <!-- Dropdown Control -->
              <DropdownControl
                v-else-if="control.type === 'dropdown'"
                v-model="settings.currentSettings[control.id]"
                :label="control.name"
                :options="control.options"
                @change="handleChange"
              />
  
              <!-- Color Control -->
              <ColorControl
                v-else-if="control.type === 'color'"
                v-model="settings.currentSettings[control.id]"
                :label="control.name"
                @change="handleChange"
              />
  
              <!-- Modal Button Control -->
              <ModalButton
                v-else-if="control.type === 'modal'"
                :label="control.name"
                @click="openModal(control.modalType)"
              />
            </template>
          </div>
        </div>
      </div>
  
      <!-- Modals -->
      <BaseModal
        v-model="showFontModal"
        title="Select Font"
      >
        <p>Font selector placeholder - to be implemented</p>
      </BaseModal>
  
      <BaseModal
        v-model="showBackgroundModal"
        title="Select Background"
      >
        <p>Background selector placeholder - to be implemented</p>
      </BaseModal>
    </div>
  </template>
  
  <script>
  import { computed, ref } from 'vue';
  import SliderControl from './controls/SliderControl.vue';
  import DropdownControl from './controls/DropdownControl.vue';
  import ColorControl from './controls/ColorControl.vue';
  import ModalButton from './controls/ModalButton.vue';
  import BaseModal from './modals/BaseModal.vue';
  import { controlDefinitions, useSettingsStore } from '../stores/settings';
  
  export default {
    name: 'ControlPanel',
    components: {
      SliderControl,
      DropdownControl,
      ColorControl,
      ModalButton,
      BaseModal
    },
    setup() {
      const settings = useSettingsStore();
      const showFontModal = ref(false);
      const showBackgroundModal = ref(false);
      const fileInput = ref(null);
  
      const groupedControls = computed(() => {
        const groups = {};
        controlDefinitions.forEach(control => {
          if (!groups[control.category]) {
            groups[control.category] = {
              name: control.category,
              controls: []
            };
          }
          groups[control.category].controls.push(control);
        });
        return Object.values(groups);
      });
  
      const canUndo = computed(() => settings.undoStack.value.length > 0);
      const canRedo = computed(() => settings.redoStack.value.length > 0);
      
      const lastUndoAction = computed(() => 
        settings.undoStack.value.length > 0 
          ? settings.undoStack.value[settings.undoStack.value.length - 1].action 
          : ''
      );
  
      const nextRedoAction = computed(() => 
        settings.redoStack.value.length > 0 
          ? settings.redoStack.value[settings.redoStack.value.length - 1].action 
          : ''
      );
  
      const handleChange = ({ action }) => {
        console.log('handleChange2', action);
        settings.recordChange(action);
      };
  
      const openModal = (type) => {
        switch(type) {
          case 'font':
            showFontModal.value = true;
            break;
          case 'background':
            showBackgroundModal.value = true;
            break;
        }
      };
  
      const exportToFile = () => {
        const dataStr = settings.exportSettings();
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', 'style-settings.json');
        linkElement.click();
      };
  
      const importFromFile = (event) => {
        const file = event.target.files[0];
        if (!file) return;
  
        const reader = new FileReader();
        reader.onload = (e) => {
          if (settings.importSettings(e.target.result)) {
            // Success
          } else {
            alert('Invalid settings file');
          }
        };
        reader.readAsText(file);
      };
  
      const generatePermalink = () => {
        const settingsData = settings.exportSettings();
        const encoded = btoa(settingsData);
        const url = `${window.location.origin}${window.location.pathname}?settings=${encoded}`;
        
        navigator.clipboard.writeText(url).then(() => {
          alert('Permalink copied to clipboard!');
        });
      };
  
      return {
        settings,
        groupedControls,
        showFontModal,
        showBackgroundModal,
        fileInput,
        canUndo,
        canRedo,
        lastUndoAction,
        nextRedoAction,
        handleChange,
        openModal,
        exportToFile,
        importFromFile,
        generatePermalink
      };
    }
  };
  </script>