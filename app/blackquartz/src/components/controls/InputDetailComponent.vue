
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
      :style="computedContainerStyle"
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
      
      <!-- Debug info in development mode -->
      <div v-if="showDebug" class="debug-info">
        <details>
          <summary>Debug Info</summary>
          <pre>internalSize: {{ JSON.stringify(internalSize) }}</pre>
          <pre>props.size: {{ JSON.stringify(size) }}</pre>
          <pre>position: {{ JSON.stringify(currentPosition) }}</pre>
          <pre>isDragging: {{ isDragging }}</pre>
        </details>
      </div>
    </div>
  </template>
  
  <script>
/**
 * InputDetailComponent
 * ====================
 * A flexible, multi-mode detail panel/popup component that can display content
 * in various configurations: panel, popup, modal, or tearoff window.
 * 
 * FEATURES:
 * - Multiple display modes: inline panel, popup, modal, or tearoff window
 * - Smart positioning relative to target elements
 * - Draggable when in tearoff mode
 * - Resizable when in tearoff mode
 * - Responsive design with mobile fallbacks
 * - Optional default footer with Apply/Cancel buttons
 * - Customizable via slots
 * - Debug mode for development
 * 
 * BASIC USAGE:
 * ```vue
 * <InputDetailComponent
 *   v-model:visible="isDetailVisible"
 *   title="Edit Settings"
 *   display-mode="popup"
 *   :target-element="buttonRef"
 * >
 *   <div>Your detail content goes here</div>
 * </InputDetailComponent>
 * ```
 * 
 * PROPS:
 * @prop {Boolean} visible - Controls component visibility
 * @prop {String} title - Header title text (default: 'Input Details')
 * @prop {String} displayMode - Display mode: 'panel', 'popup', 'modal', 'tearoff' (default: 'popup')
 * @prop {Object} position - Position for tearoff/popup modes: {top: '100px', left: '100px'}
 * @prop {Object} size - Size dimensions: {width: '400px', height: 'auto'}
 * @prop {Object} targetElement - DOM element reference for popup positioning
 * @prop {Boolean} showDefaultFooter - Show the default Apply/Cancel footer (default: true)
 * @prop {Boolean} displayModeControls - Show mode toggle buttons in header (default: true)
 * @prop {Boolean} canTearOff - Allow tearing off the panel (default: true)
 * @prop {Boolean} debug - Enable debug info display (default: false)
 * 
 * EVENTS:
 * @emits {close} - When component is closed
 * @emits {apply} - When Apply button is clicked
 * @emits {cancel} - When Cancel button is clicked
 * @emits {update:displayMode} - When display mode changes, for v-model:displayMode
 * @emits {update:position} - When position changes, for v-model:position
 * @emits {update:size} - When size changes, for v-model:size
 * 
 * SLOTS:
 * @slot default - Main content area
 * @slot footer - Custom footer (replaces default Apply/Cancel buttons)
 * 
 * DISPLAY MODES:
 * - panel: Inline display within parent container
 * - popup: Floating panel positioned relative to targetElement
 * - modal: Centered overlay with background dimming
 * - tearoff: Draggable, resizable floating window
 * 
 * INTERNAL BEHAVIOR:
 * - The component uses ResizeObserver to track size changes when resizable
 * - Dragging uses pointer events with requestAnimationFrame for smooth movement
 * - Mobile detection switches to fullscreen modal on small screens
 * - Position calculations ensure the component stays visible in the viewport
 * - Separate internal size tracking to prevent prop/DOM sync issues
 * 
 * STYLING:
 * - The component uses scoped styles with a clean, minimal design
 * - Main container: .input-detail-component
 * - Mode-specific classes: .display-mode-panel, .display-mode-modal, .display-mode-tearoff
 * - For state: .is-dragging
 * - Sections: .detail-header, .detail-body, .detail-footer
 * - Customize with global CSS targeting these classes with higher specificity
 * 
 * DEBUGGING:
 * - Enable debugging with :debug="true" prop
 * - Debug panel shows size, position, and dragging state
 * - Console logs track mode changes, resize operations, and position calculations
 * - Check for resize observer issues if size updates aren't working
 * - Verify targetElement is valid when using popup mode
 * 
 * EXAMPLES:
 * 
 * Basic modal:
 * ```vue
 * <InputDetailComponent
 *   v-model:visible="showModal"
 *   display-mode="modal"
 *   title="Confirm Action"
 * >
 *   <p>Are you sure you want to proceed?</p>
 * </InputDetailComponent>
 * ```
 * 
 * Custom footer:
 * ```vue
 * <InputDetailComponent
 *   v-model:visible="showSettings"
 *   :show-default-footer="false"
 * >
 *   <template #default>Settings content</template>
 *   <template #footer>
 *     <button @click="saveAndClose">Save & Close</button>
 *   </template>
 * </InputDetailComponent>
 * ```
 * 
 * Tearoff panel:
 * ```vue
 * <InputDetailComponent
 *   v-model:visible="showEditor"
 *   v-model:position="editorPosition"
 *   v-model:size="editorSize"
 *   v-model:display-mode="editorMode"
 *   display-mode="tearoff"
 *   title="Code Editor"
 * >
 *   <textarea v-model="code"></textarea>
 * </InputDetailComponent>
 * ```
 */




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
      },
      // Add debug option to show sizing information
      debug: {
        type: Boolean,
        default: false
      }
    },
    emits: [
      'close',
      'apply',
      'cancel',
      'update:displayMode',
      'update:position',
      'update:size'
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
        isMobile: false,
        resizeObserver: null,
        resizeDebounceTimeout: null,
        
        // Critical: Keep internal size tracking separate from props
        internalSize: { ...this.size },
        
        // Flag to prevent size overrides during resize operations
        isResizing: false,
        
        // Add showDebug flag
        showDebug: this.debug
      };
    },
    computed: {
      canDrag() {
        return this.displayMode === 'tearoff' && !this.isMobile;
      },
      
      // Create a computed property for style that combines internalSize
      computedContainerStyle() {
        // Base style determined by display mode
        let baseStyle = {};
        
        // Mobile style
        if (this.isMobile) {
          baseStyle = {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1000,
            resize: 'none'
          };
        }
        // Panel style
        else if (this.displayMode === 'panel') {
          baseStyle = {
            position: 'relative',
            top: 'auto',
            left: 'auto',
            width: '100%',
            height: '100%'
          };
        }
        // Modal style
        else if (this.displayMode === 'modal') {
          baseStyle = {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: this.internalSize.width,
            height: this.internalSize.height,
            maxWidth: '90vw',
            maxHeight: '90vh',
            zIndex: 1050
          };
        }
        // Popup or tearoff style
        else {
          baseStyle = {
            position: 'fixed',
            top: this.currentPosition.top,
            left: this.currentPosition.left,
            width: this.internalSize.width,
            height: this.internalSize.height,
            zIndex: 1000,
            resize: this.displayMode === 'tearoff' ? 'both' : 'none',
            overflow: 'auto',
            minWidth: '300px',
            minHeight: '200px'
          };
        }
        
        // Log the style in development
        if (this.debug) {
          console.log("[Debug] Computed style:", baseStyle);
        }
        
        return baseStyle;
      }
    },
    watch: {
      position: {
        handler(newPosition) {
          this.currentPosition = { ...newPosition };
          if (this.debug) console.log("[Debug] Position updated from prop:", this.currentPosition);
        },
        deep: true
      },
      
      // Watch size prop changes, but don't override during internal resize operations
      size: {
        handler(newSize) {
          if (this.isResizing) {
            console.log("[Debug] Ignoring size prop change during resize operation");
            return;
          }
          
          if (this.debug) {
            console.log("[Debug] Size prop changed:", newSize);
          }
          
          // Update internal size from props
          this.internalSize = { ...newSize };
        },
        deep: true,
        immediate: true
      },
      
      visible: {
        handler(isVisible) {
          if (isVisible) {
            this.checkIfMobile();
            
            // Debugging
            if (this.debug) {
              console.log("[Debug] Panel becoming visible. Mode:", this.displayMode);
              console.log("[Debug] Current size:", this.internalSize);
            }
            
            this.$nextTick(() => {
              // Position handling based on display mode
              if (this.isMobile) {
                // Mobile gets fullscreen layout
              } else if (this.displayMode === 'popup' && this.targetElement) {
                this.calculatePopupPosition();
              } else if (this.displayMode === 'tearoff') {
                // Center if no position
                if (!this.currentPosition.top || this.currentPosition.top === '0px') {
                  this.centerInViewport();
                }
              }
            });
          }
        },
        immediate: true
      },
      
      displayMode: {
        handler(newMode, oldMode) {
          this.checkIfMobile();
          
          if (this.debug) {
            console.log(`[Debug] Display mode changing: ${oldMode} -> ${newMode}`);
          }
          
          // Force modal on mobile if tearoff requested
          if (this.isMobile && newMode === 'tearoff') {
            this.$emit('update:displayMode', 'modal');
            return;
          }
          
          this.$nextTick(() => {
            // Reposition based on new mode
            if (newMode === 'popup' && this.targetElement) {
              this.calculatePopupPosition();
            } else if (newMode === 'tearoff') {
              if (!this.currentPosition.top || this.currentPosition.top === '0px') {
                this.centerInViewport();
              }
            }
          });
        }
      }
    },
    mounted() {
      if (this.debug) {
        console.log("[Debug] Component mounted. Initial size:", this.internalSize);
      }
      
      // Add click-outside listener for all modes except panel
      if (this.displayMode !== 'panel') {
        document.addEventListener('mousedown', this.handleClickOutside);
      }
      
      // Watch for window resizing
      window.addEventListener('resize', this.checkIfMobile);
      this.checkIfMobile();
      
      // Initialize the resize observer
      this.setupResizeObserver();
    },
    
    beforeUnmount() {
      document.removeEventListener('mousedown', this.handleClickOutside);
      window.removeEventListener('resize', this.checkIfMobile);
      this.stopDrag();
      
      if (this.resizeDebounceTimeout) {
        clearTimeout(this.resizeDebounceTimeout);
      }
      
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      }
    },
    
    methods: {
      // Set up the resize observer to detect size changes
      setupResizeObserver() {
        // Create the resize observer
        this.resizeObserver = new ResizeObserver(entries => {
          // Only process if we're in tearoff mode, visible, and not mobile
          if (this.displayMode === 'tearoff' && !this.isMobile && this.visible) {
            // Debounce the resize events
            if (this.resizeDebounceTimeout) {
              clearTimeout(this.resizeDebounceTimeout);
            }
            
            this.resizeDebounceTimeout = setTimeout(() => {
              const container = this.$refs.componentContainer;
              if (!container) return;
              
              // Get actual size from computed style
              const computedStyle = window.getComputedStyle(container);
              const newWidth = computedStyle.width;
              const newHeight = computedStyle.height;
              
              const newSize = {
                width: newWidth,
                height: newHeight
              };
              
              // Only update if there's a real change
              if (this.internalSize.width !== newWidth || 
                  this.internalSize.height !== newHeight) {
                
                if (this.debug) {
                  console.log("[Debug] Size changed by resize observer:", newSize);
                }
                
                // Set the resizing flag to prevent size overrides
                this.isResizing = true;
                
                // Update internal size
                this.internalSize = newSize;
                
                // Emit the change to parent
                this.$emit('update:size', newSize);
                
                // Clear the resizing flag after a delay to ensure prop updates complete
                setTimeout(() => {
                  this.isResizing = false;
                  if (this.debug) console.log("[Debug] Resize operation complete");
                }, 200);
              }
            }, 100); // 100ms debounce
          }
        });
        
        // Start observing when component is mounted
        this.$nextTick(() => {
          if (this.$refs.componentContainer) {
            this.resizeObserver.observe(this.$refs.componentContainer);
            if (this.debug) console.log("[Debug] Resize observer attached");
          }
        });
      },
      
      // Check if screen is "mobile" sized
      checkIfMobile() {
        const wasMobile = this.isMobile;
        this.isMobile = (window.innerWidth < 768 || window.innerHeight < 600);
        
        if (wasMobile !== this.isMobile && this.debug) {
          console.log(`[Debug] Mobile status changed: ${wasMobile} -> ${this.isMobile}`);
        }
      },
      
      // Center in the viewport if we have no position
      centerInViewport() {
        // Parse size values
        const widthValue = this.internalSize.width;
        const heightValue = this.internalSize.height;
        
        let containerWidth = 400;
        let containerHeight = 300;
        
        // Parse numeric values (handle both "400px" and 400)
        if (typeof widthValue === 'string' && widthValue.endsWith('px')) {
          containerWidth = parseInt(widthValue) || 400;
        } else if (typeof widthValue === 'number') {
          containerWidth = widthValue;
        }
        
        if (typeof heightValue === 'string' && heightValue.endsWith('px')) {
          containerHeight = parseInt(heightValue) || 300;
        } else if (typeof heightValue === 'number') {
          containerHeight = heightValue;
        }
        
        // Calculate center position
        const centerX = (window.innerWidth - containerWidth) / 2;
        const centerY = (window.innerHeight - containerHeight) / 2;
        
        // Set position
        this.currentPosition = {
          top: `${Math.max(0, centerY)}px`,
          left: `${Math.max(0, centerX)}px`
        };
        
        if (this.debug) {
          console.log("[Debug] Centered in viewport:", this.currentPosition);
        }
        
        // Emit position update
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
        
        // Position vertically
        if (spaceBelow >= componentHeight || spaceBelow >= spaceAbove) {
          // Position below target
          top = `${targetRect.bottom + 5}px`;
        } else {
          // Position above target
          top = `${targetRect.top - componentHeight - 5}px`;
        }
        
        // Position horizontally
        left = `${targetRect.left}px`;
        
        // Prevent off-screen horizontally
        const rightEdge = targetRect.left + componentRect.width;
        if (rightEdge > viewportWidth - 10) {
          left = `${Math.max(10, viewportWidth - componentRect.width - 10)}px`;
        }
        
        this.currentPosition = { top, left };
        
        if (this.debug) {
          console.log("[Debug] Popup position calculated:", this.currentPosition);
        }
        
        this.$emit('update:position', this.currentPosition);
      },
      
      // Begin drag on pointerdown (only if canDrag = true)
      startDrag(event) {
        if (event.button !== 0) return; // left click only
        event.preventDefault();
        
        if (this.debug) {
          console.log("[Debug] Starting drag operation");
        }
        
        // Capture the pointer for consistent movement tracking
        if (event.target.setPointerCapture) {
          event.target.setPointerCapture(event.pointerId);
          this.pointerId = event.pointerId;
        }
        
        const container = this.$refs.componentContainer;
        if (!container) return;
        
        const containerRect = container.getBoundingClientRect();
        
        // Calculate drag offset (where in the header the user clicked)
        this.dragOffset = {
          x: event.clientX - containerRect.left,
          y: event.clientY - containerRect.top
        };
        
        // Store current size during drag to prevent unintended resizing
        const currentStyle = window.getComputedStyle(container);
        const width = currentStyle.width;
        const height = currentStyle.height;
        
        if (this.debug) {
          console.log("[Debug] Current size at drag start:", { width, height });
        }
        
        // Set our internal size record to match current actual size
        this.internalSize = { width, height };
        
        // Set drag state flags
        this.isDragging = true;
        this.dragActive = true;
        this.mousePosition = { x: event.clientX, y: event.clientY };
        
        // Add event listeners for drag operation
        this.$refs.detailHeader.addEventListener('pointermove', this.onPointerMove);
        this.$refs.detailHeader.addEventListener('pointerup', this.stopDrag);
        this.$refs.detailHeader.addEventListener('pointercancel', this.stopDrag);
        document.addEventListener('pointerup', this.stopDrag); // Fallback
        
        // Start animation frame for smooth drag
        this.rafId = requestAnimationFrame(this.updateDragPosition);
      },
      
      // Track mouse movement during drag
      onPointerMove(event) {
        this.mousePosition = { x: event.clientX, y: event.clientY };
      },
      
      // Update position during drag animation
      updateDragPosition() {
        if (!this.dragActive) return;
        
        const { x, y } = this.mousePosition;
        
        // Calculate new position
        let newLeft = x - this.dragOffset.x;
        let newTop = y - this.dragOffset.y;
        
        // Get container dimensions
        const container = this.$refs.componentContainer;
        if (!container) return;
        
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        const minVisible = 100; // Min visible pixels
        
        // Constrain to viewport
        newLeft = Math.max(-containerWidth + minVisible,
                         Math.min(newLeft, window.innerWidth - minVisible));
        newTop = Math.max(0,
                        Math.min(newTop, window.innerHeight - minVisible));
        
        // Update position
        this.currentPosition = {
          top: `${newTop}px`,
          left: `${newLeft}px`
        };
        
        // Emit position update
        this.$emit('update:position', this.currentPosition);
        
        // Continue animation
        this.rafId = requestAnimationFrame(this.updateDragPosition);
      },
      
      // End drag operation
      stopDrag(event) {
        if (!this.dragActive) return;
        
        if (this.debug) {
          console.log("[Debug] Stopping drag operation");
        }
        
        // Clear drag state
        this.dragActive = false;
        this.isDragging = false;
        
        // Release pointer capture
        if (this.pointerId != null && event?.target && event.target.releasePointerCapture) {
          try {
            event.target.releasePointerCapture(this.pointerId);
          } catch (e) {
            // Ignore errors releasing capture
          }
          this.pointerId = null;
        }
        
        // Cancel animation frame
        if (this.rafId) {
          cancelAnimationFrame(this.rafId);
          this.rafId = null;
        }
        
        // Remove all event listeners
        const header = this.$refs.detailHeader;
        if (header) {
          header.removeEventListener('pointermove', this.onPointerMove);
          header.removeEventListener('pointerup', this.stopDrag);
          header.removeEventListener('pointercancel', this.stopDrag);
        }
        document.removeEventListener('pointerup', this.stopDrag);
        
        // Critical: Capture the current size AFTER drag is complete
        const container = this.$refs.componentContainer;
        if (container) {
          // Check actual rendered size after drag
          const computedStyle = window.getComputedStyle(container);
          const newSize = {
            width: computedStyle.width,
            height: computedStyle.height
          };
          
          if (this.debug) {
            console.log("[Debug] Size after drag:", newSize);
          }
          
          // Update internal size tracker with current actual size
          this.internalSize = newSize;
          
          // Emit size update to parent (very important!)
          this.$emit('update:size', newSize);
        }
      },
      
      // Handle clicks outside the component
      handleClickOutside(event) {
        if (this.displayMode === 'panel') return;
        if (this.isDragging) return;
        return; // Changed my mind. Shouldn't actually close the panel on click outside.
        // const container = this.$refs.componentContainer;
        // const target = this.targetElement;
        
        // if (
        //   container &&
        //   !container.contains(event.target) &&
        //   (!target || !target.contains(event.target))
        // ) {
        //   this.closePanel();
        // }
      },
      
      // Close the panel
      closePanel() {
        if (this.debug) {
          console.log("[Debug] Closing panel");
        }
        this.$emit('close');
      },
      
      // Emit apply event
      apply() {
        this.$emit('apply');
      },
      
      // Emit cancel event
      cancel() {
        this.$emit('cancel');
      },
      
      // Change display mode
      setDisplayMode(mode) {
        if (this.debug) {
          console.log(`[Debug] Setting display mode to: ${mode}`);
        }
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
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
    resize: both;
    min-width: 300px;
    min-height: 200px;
    overflow: auto;
  }
  
  .is-dragging {
    cursor: grabbing;
    user-select: none;
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
  
  /* Debug Info Styles */
  .debug-info {
    font-size: 12px;
    padding: 8px;
    border-top: 1px dashed #ddd;
    background-color: #f7f7f7;
    font-family: monospace;
  }
  
  .debug-info details {
    margin: 0;
  }
  
  .debug-info pre {
    margin: 4px 0;
    white-space: pre-wrap;
  }
  </style>
  