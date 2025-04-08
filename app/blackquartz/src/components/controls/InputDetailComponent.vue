<template>
    <div 
      v-if="visible" 
      class="input-detail-component"
      :class="{
        'display-mode-panel': displayMode === 'panel',
        'display-mode-modal': displayMode === 'modal',
        'display-mode-tearoff': displayMode === 'tearoff' && !isMobile,
        'is-dragging': isDragging
      }"
      :style="containerStyle"
      ref="componentContainer"
    >
      <!-- Header with title and controls -->
      <div 
        class="detail-header"
        :class="{ 'draggable-header': canDrag }"
        ref="detailHeader"
        @pointerdown="canDrag ? startDrag($event) : null"
      >
        <h3>{{ title || 'Input Details' }}</h3>
        
        <div class="header-controls">
          <!-- Display mode toggle if enabled -->
          <div v-if="displayModeControls" class="display-mode-controls">
            <!-- Show tearoff button only if not on mobile and canTearOff is true -->
            <button 
              v-if="!isMobile && canTearOff && displayMode !== 'tearoff'"
              class="mode-btn tearoff-btn" 
              @click="setDisplayMode('tearoff')"
              title="Tear off panel"
            >
              <span>⬈</span>
            </button>
            
            <button 
              v-if="displayMode === 'tearoff'"
              class="mode-btn dock-btn" 
              @click="setDisplayMode('popup')"
              title="Dock panel"
            >
              <span>⬋</span>
            </button>
          </div>
          
          <!-- Close button -->
          <button class="close-btn" @click="closePanel">×</button>
        </div>
      </div>
      
      <!-- Main content area -->
      <div class="detail-body">
        <slot></slot>
      </div>
      
      <!-- Footer area with buttons if needed -->
      <div v-if="$slots.footer" class="detail-footer">
        <slot name="footer"></slot>
      </div>
      
      <!-- Default footer with Apply/Cancel buttons -->
      <div v-else-if="showDefaultFooter" class="detail-footer">
        <button class="btn cancel" @click="cancel">Cancel</button>
        <button class="btn apply" @click="apply">Apply</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'InputDetailComponent',
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      title: {
        type: String,
        default: ''
      },
      displayMode: {
        type: String,
        default: 'popup', // popup, modal, tearoff, panel
        validator: (value) => ['popup', 'modal', 'tearoff', 'panel'].includes(value)
      },
      position: {
        type: Object,
        default: () => ({ top: '100px', left: '100px' })
      },
      size: {
        type: Object,
        default: () => ({ width: '400px', height: 'auto' })
      },
      targetElement: {
        type: Object,
        default: null
      },
      showDefaultFooter: {
        type: Boolean,
        default: true
      },
      displayModeControls: {
        type: Boolean,
        default: true
      },
      canTearOff: {
        type: Boolean,
        default: true
      }
    },
    emits: [
      'close',
      'apply',
      'cancel',
      'update:displayMode',
      'update:position',
      'update:size'    // so parent can remember new size after manual resize
    ],
    data() {
      return {
        isDragging: false,
        dragOffset: { x: 0, y: 0 },
        currentPosition: { ...this.position },
        mousePosition: { x: 0, y: 0 },
        dragActive: false,
        rafId: null,
        pointerId: null,
  
        // Track if we consider the device "mobile" based on viewport
        isMobile: false,
  
        // A ResizeObserver to detect manual panel resizing
        resizeObserver: null
      };
    },
    computed: {
      canDrag() {
        // The user can only drag if displayMode is 'tearoff' and not on mobile
        return this.displayMode === 'tearoff' && !this.isMobile;
      },
      containerStyle() {
        // If on a "mobile" sized screen, take up the whole screen
        if (this.isMobile) {
          return {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1000,
            // no resize on mobile
            resize: 'none'
          };
        }
  
        // Otherwise, pick style based on displayMode
        if (this.displayMode === 'panel') {
          return {
            position: 'relative',
            top: 'auto',
            left: 'auto',
            width: '100%',
            height: '100%'
          };
        } else if (this.displayMode === 'modal') {
          return {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: this.size.width,
            height: this.size.height,
            maxWidth: '90vw',
            maxHeight: '90vh',
            zIndex: 1050
          };
        } else {
          // popup or tearoff
          return {
            position: 'fixed',
            top: this.currentPosition.top,
            left: this.currentPosition.left,
            width: this.size.width,
            height: this.size.height,
            zIndex: 1000,
            // only show resize handle if tearoff
            resize: this.displayMode === 'tearoff' ? 'both' : 'none',
            overflow: 'auto',
            minWidth: '300px',
            minHeight: '200px'
          };
        }
      }
    },
    watch: {
      position: {
        handler(newPosition) {
          this.currentPosition = { ...newPosition };
        },
        deep: true
      },
      visible: {
        handler(isVisible) {
          if (isVisible) {
            this.checkIfMobile();
            this.$nextTick(() => {
              // Switch to full screen if isMobile
              if (this.isMobile) {
                // Force a "mobile fullscreen" layout
                // (We won't forcibly change displayMode, we just override style.)
              } else {
                // If in popup mode, recalc
                if (this.displayMode === 'popup' && this.targetElement) {
                  this.calculatePopupPosition();
                } else if (this.displayMode === 'tearoff') {
                  // If no position, center
                  if (!this.currentPosition.top || this.currentPosition.top === '0px') {
                    this.centerInViewport();
                  }
                }
              }
            });
          }
        },
        immediate: true
      },
      displayMode: {
        handler(newMode) {
          // If we switch to tearoff, check if we are mobile
          this.checkIfMobile();
          if (this.isMobile && newMode === 'tearoff') {
            // If we forcibly want to disallow tearoff on mobile, switch to "popup" or "modal"
            this.$emit('update:displayMode', 'modal'); 
            return;
          }
  
          if (newMode === 'popup' && this.targetElement) {
            this.$nextTick(() => {
              this.calculatePopupPosition();
            });
          }
          
          if (newMode === 'tearoff') {
            this.$nextTick(() => {
              if (!this.currentPosition.top || this.currentPosition.top === '0px') {
                this.centerInViewport();
              }
            });
          }
        }
      }
    },
    mounted() {
      // Add a click-outside listener for all modes except panel
      if (this.displayMode !== 'panel') {
        document.addEventListener('mousedown', this.handleClickOutside);
      }
  
      // Watch for window resizing to detect mobile changes on the fly
      window.addEventListener('resize', this.checkIfMobile);
      this.checkIfMobile();
  
      // Setup a ResizeObserver to track manual resizing of the tearoff
      if ('ResizeObserver' in window) {
        this.resizeObserver = new ResizeObserver(entries => {
          for (const entry of entries) {
            // Only apply size changes if we're in tearoff mode and not mobile
            if (this.displayMode === 'tearoff' && !this.isMobile) {
              const { width, height } = entry.contentRect;
              const newSize = {
                width: Math.round(width) + 'px',
                height: Math.round(height) + 'px'
              };
              // Emit so parent can store the new size
              this.$emit('update:size', newSize);
            }
          }
        });
  
        if (this.$refs.componentContainer) {
          this.resizeObserver.observe(this.$refs.componentContainer);
        }
      }
    },
    beforeUnmount() {
      document.removeEventListener('mousedown', this.handleClickOutside);
      window.removeEventListener('resize', this.checkIfMobile);
      this.stopDrag(); // Ensure any ongoing drag is cleaned up
  
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      }
    },
    methods: {
      // Check if screen is "mobile" sized
      checkIfMobile() {
        this.isMobile = (window.innerWidth < 1024 || window.innerHeight < 1024);
      },
  
      // Center in the viewport if we have no position
      centerInViewport() {
        const containerWidth = parseInt(this.size.width) || 400;
        const containerHeight = parseInt(this.size.height) || 300;
        
        const centerX = (window.innerWidth - containerWidth) / 2;
        const centerY = (window.innerHeight - containerHeight) / 2;
        
        this.currentPosition = {
          top: `${Math.max(0, centerY)}px`,
          left: `${Math.max(0, centerX)}px`
        };
        this.$emit('update:position', this.currentPosition);
      },
      
      // Position a popup next to targetElement
      calculatePopupPosition() {
        if (!this.targetElement) return;
        
        const targetRect = this.targetElement.getBoundingClientRect();
        const componentContainer = this.$refs.componentContainer;
        
        if (!componentContainer) return;
        
        const componentRect = componentContainer.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Check vertical space
        const spaceBelow = viewportHeight - targetRect.bottom;
        const spaceAbove = targetRect.top;
        const componentHeight = componentRect.height;
        
        let top, left;
        
        if (spaceBelow >= componentHeight || spaceBelow >= spaceAbove) {
          // Position below target
          top = `${targetRect.bottom + 5}px`;
        } else {
          // Position above target
          top = `${targetRect.top - componentHeight - 5}px`;
        }
        
        left = `${targetRect.left}px`;
        
        // Prevent off-screen horizontally
        const rightEdge = targetRect.left + componentRect.width;
        if (rightEdge > viewportWidth - 10) {
          left = `${Math.max(10, viewportWidth - componentRect.width - 10)}px`;
        }
        
        this.currentPosition = { top, left };
        this.$emit('update:position', { top, left });
      },
      
      // Begin drag on pointerdown (only if canDrag = true)
      startDrag(event) {
        if (event.button !== 0) return; // left click only
        event.preventDefault();
        
        // Capture the pointer so we keep getting pointer events
        event.target.setPointerCapture(event.pointerId);
        this.pointerId = event.pointerId;
  
        const container = this.$refs.componentContainer;
        const height = container.offsetHeight;
        const width = container.offsetWidth;
        const containerRect = container.getBoundingClientRect();
        
        this.dragOffset = {
          x: event.clientX - containerRect.left,
          y: event.clientY - containerRect.top
        };
        
        // Fix the container size while dragging
        container.style.height = `${height}px`;
        container.style.width = `${width}px`;
        
        this.isDragging = true;
        this.dragActive = true;
        this.mousePosition = { x: event.clientX, y: event.clientY };
        
        // Listen for pointermove & pointerup on the header
        this.$refs.detailHeader.addEventListener('pointermove', this.onPointerMove);
        this.$refs.detailHeader.addEventListener('pointerup', this.stopDrag);
        
        // Start RAF for continuous drag updates
        this.rafId = requestAnimationFrame(this.updateDragPosition);
      },
      
      onPointerMove(event) {
        this.mousePosition = { x: event.clientX, y: event.clientY };
      },
  
      updateDragPosition() {
        if (!this.dragActive) return;
        
        const { x, y } = this.mousePosition;
        
        let newLeft = x - this.dragOffset.x;
        let newTop = y - this.dragOffset.y;
        
        const containerWidth = this.$refs.componentContainer.offsetWidth;
        const containerHeight = this.$refs.componentContainer.offsetHeight;
        const minVisible = 100;
        
        newLeft = Math.max(-containerWidth + minVisible,
                           Math.min(newLeft, window.innerWidth - minVisible));
        newTop = Math.max(0,
                          Math.min(newTop, window.innerHeight - minVisible));
        
        this.currentPosition = {
          top: `${newTop}px`,
          left: `${newLeft}px`
        };
        this.$emit('update:position', this.currentPosition);
        
        this.rafId = requestAnimationFrame(this.updateDragPosition);
      },
      
      stopDrag(event) {
        if (!this.dragActive) return;
  
        this.dragActive = false;
        this.isDragging = false;
        
        if (this.pointerId != null && event?.target) {
          event.target.releasePointerCapture(this.pointerId);
          this.pointerId = null;
        }
  
        if (this.rafId) {
          cancelAnimationFrame(this.rafId);
          this.rafId = null;
        }
  
        const container = this.$refs.componentContainer;
        if (container) {
          container.style.height = '';
          container.style.width = '';
        }
        
        this.$refs.detailHeader.removeEventListener('pointermove', this.onPointerMove);
        this.$refs.detailHeader.removeEventListener('pointerup', this.stopDrag);
      },
      
      handleClickOutside(event) {
        if (this.displayMode === 'panel') return;
        if (this.isDragging) return;
        
        const container = this.$refs.componentContainer;
        const target = this.targetElement;
        
        if (
          container &&
          !container.contains(event.target) &&
          (!target || !target.contains(event.target))
        ) {
          this.closePanel();
        }
      },
      
      closePanel() {
        this.$emit('close');
      },
      
      apply() {
        this.$emit('apply');
      },
      
      cancel() {
        this.$emit('cancel');
      },
      
      setDisplayMode(mode) {
        this.$emit('update:displayMode', mode);
      }
    }
  };
  </script>
  
  <style scoped>
  .input-detail-component {
    background-color: white;
    border-radius: 8px;
    border: 1px solid #ddd;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  /* Display mode specific styles */
  .display-mode-panel {
    box-shadow: none;
    border-radius: 0;
    border-width: 0;
  }
  
  .display-mode-modal::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: -1;
  }
  
  .display-mode-tearoff {
    /* We'll apply resize in JS as well, but
       in case needed, here's a fallback: */
    resize: both;
    min-width: 300px;
    min-height: 200px;
  }
  
  .is-dragging {
    cursor: grabbing;
  }
  
  /* Header Styles */
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #eee;
    background-color: #f9f9f9;
  }
  
  .draggable-header {
    cursor: grab;
    user-select: none;
  }
  
  .draggable-header:active,
  .is-dragging .draggable-header {
    cursor: grabbing;
  }
  
  .detail-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    color: #333;
    user-select: none;
  }
  
  .header-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .display-mode-controls {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .mode-btn {
    background: none;
    border: none;
    font-size: 16px;
    cursor: pointer;
    color: #666;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
  }
  
  .mode-btn:hover {
    background-color: #eee;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #666;
    line-height: 1;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
  }
  
  .close-btn:hover {
    background-color: #eee;
    color: #333;
  }
  
  /* Body Styles */
  .detail-body {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
  }
  
  .display-mode-panel .detail-body {
    padding: 12px;
  }
  
  /* Footer Styles */
  .detail-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 16px;
    border-top: 1px solid #eee;
    background-color: #f9f9f9;
  }
  
  /* Buttons */
  .btn {
    padding: 6px 12px;
    border-radius: 4px;
    border: none;
    font-size: 13px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .btn.cancel {
    background-color: #f0f0f0;
    color: #333;
  }
  
  .btn.cancel:hover {
    background-color: #e0e0e0;
  }
  
  .btn.apply {
    background-color: #4a8bf5;
    color: white;
  }
  
  .btn.apply:hover {
    background-color: #3a7ce5;
  }
  </style>

  