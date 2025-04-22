import { ref } from 'vue';

export function usePanel(defaultDisplayMode = 'popup', defaultPanelSize = { width: '500px', height: '600px' }) {
  const panelOpen = ref(false);
  const displayMode = ref(defaultDisplayMode);
  const panelPosition = ref({ top: '0px', left: '0px' });
  const panelSize = ref(defaultPanelSize);

  function openPanel() {
    panelOpen.value = true;
  }

  function closePanel() {
    panelOpen.value = false;
  }

  function updateDisplayMode(newMode) {
    displayMode.value = newMode;
  }

  function updatePanelPosition(newPos) {
    panelPosition.value = newPos;
  }

  return {
    panelOpen,
    displayMode,
    panelPosition,
    panelSize,
    openPanel,
    closePanel,
    updateDisplayMode,
    updatePanelPosition
  };
} 