

<template>
    <div class="picsum-image-input" ref="picsumImageInputContainer">
      <!-- Image Preview Button -->
      <div 
        class="image-preview-container" 
        :class="{ 'large': size === 'large' }"
        @click="openPanel"
        ref="imagePreview"
      >
        <div class="image-preview">
          <template v-if="selectedImage">
            <img 
              :src="selectedImage.thumbnailUrl" 
              alt="Selected Image"
              class="selected-image"
            />
          </template>
          <template v-else>
            <div class="no-image">No Image</div>
          </template>
        </div>
        <div class="image-details">
          <div class="image-name">{{ label || 'Picsum Image' }}</div>
          <div class="image-info" v-if="selectedImage">
            {{ selectedImage.author }} · {{ selectedImage.width }}x{{ selectedImage.height }}
          </div>
          <div class="image-info" v-else>
            Select an image
          </div>
        </div>
        <button 
          v-if="selectedImage" 
          class="clear-preview-btn" 
          @click.stop="clearSelectionAndEmit"
          title="Clear selection"
        >×</button>
      </div>
      
      <!-- Image Gallery Panel using InputDetailComponent -->
      <InputDetailComponent
        v-if="panelOpen"
        :visible="panelOpen"
        :title="label || 'Picsum Image Gallery'"
        :display-mode="displayMode"
        :target-element="$refs.imagePreview"
        :position="panelPosition"
        :size="panelSize"
        @update:size="panelSize = $event"
        @close="cancelSelection"
        @apply="applySelection"
        @cancel="cancelSelection"
        @update:display-mode="updateDisplayMode"
        @update:position="updatePanelPosition"
      >
        <!-- Image Gallery Panel Content -->
        <div class="image-panel-content">
          <!-- Search Controls -->
          <div class="gallery-controls">
            <div class="search-container">
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Search by author..." 
                class="search-input"
              />
            </div>
          </div>
          
          <!-- Loading Indicator -->
          <div v-if="loading" class="loading-indicator">
            Loading images...
          </div>
          
          <!-- Selected Image Preview -->
          <div class="selected-preview" v-if="tempSelectedImage && !loading">
            <div class="preview-image-container">
              <img 
                :src="tempSelectedImage.previewUrl" 
                alt="Preview" 
                class="preview-image"
              />
            </div>
            <div class="preview-details">
              <div class="preview-header">
                <h4>Selected Image</h4>
                <button class="clear-selection-btn" @click="clearSelection" title="Clear selection">×</button>
              </div>
              <p><strong>Author:</strong> {{ tempSelectedImage.author }}</p>
              <p><strong>Dimensions:</strong> {{ tempSelectedImage.width }}x{{ tempSelectedImage.height }}</p>
              <p><strong>ID:</strong> {{ tempSelectedImage.id }}</p>
            </div>
          </div>
          
          <!-- Image Gallery Grid -->
          <div v-if="!loading" class="image-gallery" ref="galleryContainer">
            <div v-if="filteredImages.length === 0" class="no-results">
              No images found. Try adjusting your search.
            </div>
            
            <div v-else class="image-grid">
              <div 
                v-for="image in filteredImages" 
                :key="image.id"
                class="image-item" 
                :class="{ 'selected': tempSelectedImage && tempSelectedImage.id === image.id }"
                @click="selectImage(image)"
              >
                <div class="image-thumbnail-container">
                  <img 
                    :src="image.thumbnailUrl" 
                    :alt="'Photo by ' + image.author"
                    class="image-thumbnail"
                  />
                </div>
                <div class="image-caption">{{ image.author }}</div>
              </div>
            </div>
          </div>
        </div>
      </InputDetailComponent>
    </div>
  </template>
  
  <script>
/**
 * PicsumImageSelector
 * ==================
 * A component for browsing and selecting images from the Picsum Photos API.
 * Provides an elegant image gallery interface with search capabilities and
 * image preview functionality.
 * 
 * FEATURES:
 * - Browse gallery of high-quality stock photos from Lorem Picsum
 * - Search images by author
 * - Image thumbnail and preview display
 * - Selected image preview with metadata
 * - Easy image selection and deselection
 * - Responsive gallery layout
 * - Compact preview in parent components
 * 
 * BASIC USAGE:
 * ```vue
 * <PicsumImageSelector
 *   v-model="selectedImageId"
 *   label="Featured Image"
 * />
 * ```
 * 
 * PROPS:
 * @prop {String} modelValue - Selected image ID (empty string if none selected)
 * @prop {String} label - Label for the component
 * @prop {String} size - UI size variant: 'regular' or 'large' (default: 'regular')
 * @prop {String} defaultDisplayMode - Initial display mode: 'popup', 'modal', 'tearoff', 'panel' (default: 'popup')
 * 
 * EVENTS:
 * @emits {update:modelValue} - When image selection changes
 * 
 * MODEL VALUE FORMAT:
 * The component uses a string value for v-model, representing the selected image ID.
 * For example: "237" would represent image ID 237 from Picsum Photos.
 * An empty string "" represents no selection.
 * 
 * INTERNAL BEHAVIOR:
 * - Loads images from Picsum Photos API (3 pages of 100 images each)
 * - Uses Vue 3 Composition API for state management
 * - Maintains temporary selection state during panel interaction
 * - Generates appropriate URLs for thumbnails and previews
 * - Implements search filtering by author name
 * - Preserves selection across panel open/close events
 * - Responsive design with mobile adaptations
 * 
 * DEPENDENCIES:
 * - Requires InputDetailComponent for the gallery panel
 * - Uses Picsum Photos API (https://picsum.photos)
 * 
 * PICSUM API USAGE:
 * - List endpoint: https://picsum.photos/v2/list
 * - Image URLs: https://picsum.photos/id/{id}/{width}/{height}
 * - Automatically handles pagination and image loading
 * 
 * STYLING:
 * - Main container: .picsum-image-input
 * - Preview button: .image-preview-container, .image-preview
 * - Size variants: .image-preview-container.large
 * - Panel content: .image-panel-content
 * - Gallery controls: .gallery-controls, .search-input
 * - Selected preview: .selected-preview, .preview-image
 * - Image gallery: .image-gallery, .image-grid, .image-item
 * - Selected state: .image-item.selected
 * - Media queries for responsive layouts at various breakpoints
 * 
 * DEBUGGING:
 * - Loading state indicates when images are being fetched
 * - Console errors for API request failures
 * - No-results message when search returns empty
 * - Responsive testing with different screen size layouts
 * 
 * EXAMPLES:
 * 
 * Basic image selector:
 * ```vue
 * <PicsumImageSelector
 *   v-model="heroImageId"
 *   label="Hero Image"
 * />
 * ```
 * 
 * Large variant with modal display:
 * ```vue
 * <PicsumImageSelector
 *   v-model="featuredImageId"
 *   label="Featured Image"
 *   size="large"
 *   default-display-mode="modal"
 * />
 * ```
 * 
 * Using the selected image ID:
 * ```vue
 * <template>
 *   <div>
 *     <PicsumImageSelector v-model="imageId" label="Background" />
 *     
 *     <div v-if="imageId" class="image-display">
 *       <img :src="`https://picsum.photos/id/${imageId}/800/600`" alt="Selected background" />
 *     </div>
 *   </div>
 * </template>
 * 
 * <script>
 * export default {
 *   data() {
 *     return {
 *       imageId: ""
 *     };
 *   }
 * }
 * </scri  pt>
 * ```
 */



  import { ref, computed, onMounted } from 'vue';
  import InputDetailComponent from './InputDetailComponent.vue';
  
  export default {
    name: 'PicsumImageSelector',
    components: {
      InputDetailComponent
    },
    props: {
      modelValue: { type: String, default: '' }, // Image ID as the v-model
      label: String,
      size: { type: String, default: 'regular' }, // 'regular' or 'large'
      defaultDisplayMode: { type: String, default: 'popup' }, // 'popup', 'modal', 'tearoff', 'panel'
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      // Panel state
      const panelOpen = ref(false);
      const displayMode = ref(props.defaultDisplayMode);
      const panelPosition = ref({ top: '0px', left: '0px' });
      const panelSize = ref({ width: '800px', height: '700px' });
      
      // Image state
      const allImages = ref([]);
      const loading = ref(true);
      const searchQuery = ref('');
      const tempSelectedImage = ref(null);
      const selectedImage = ref(null);
      
      // DOM references
      const picsumImageInputContainer = ref(null);
      const imagePreview = ref(null);
      const galleryContainer = ref(null);
      
      // Filter images based on search query
      const filteredImages = computed(() => {
        if (!searchQuery.value) {
          return allImages.value;
        }
        
        const query = searchQuery.value.toLowerCase();
        return allImages.value.filter(
          img => img.author.toLowerCase().includes(query)
        );
      });
      
      // Create URLs for image
      const createImageURLs = (image) => {
        // Return a new object with all image properties plus URL fields
        return {
          ...image,
          thumbnailUrl: `https://picsum.photos/id/${image.id}/200/200`,
          previewUrl: `https://picsum.photos/id/${image.id}/400/300`,
          smallThumbUrl: `https://picsum.photos/id/${image.id}/80/80`
        };
      };
      
      // Load all images from Picsum
      const loadAllImages = async () => {
        loading.value = true;
        
        try {
          // Load 3 pages of images with maximum limit to get most of the library
          const images = [];
          
          // Load page 1
          const page1 = await loadImagesPage(1, 100);
          images.push(...page1);
          
          // Load page 2
          const page2 = await loadImagesPage(2, 100);
          images.push(...page2);
          
          // Load page 3
          const page3 = await loadImagesPage(3, 100);
          images.push(...page3);
          
          // Process images to add URLs
          allImages.value = images.map(createImageURLs);
          
          // Initialize the selected image if we have a model value
          if (props.modelValue) {
            selectedImage.value = allImages.value.find(img => img.id === props.modelValue);
          }
        } catch (error) {
          console.error('Error loading images:', error);
        } finally {
          loading.value = false;
        }
      };
      
      // Load a single page of images
      const loadImagesPage = async (page, limit) => {
        try {
          const response = await fetch(`https://picsum.photos/v2/list?page=${page}&limit=${limit}`);
          if (response.ok) {
            return await response.json();
          }
        } catch (error) {
          console.error(`Error loading page ${page}:`, error);
        }
        return [];
      };
      
      // Methods for panel controls
      const updateDisplayMode = (newMode) => {
        displayMode.value = newMode;
      };
      
      const updatePanelPosition = (newPosition) => {
        panelPosition.value = newPosition;
      };
      
      // Open the panel
      const openPanel = () => {
        // Set the temp selected image to match the current selection
        if (selectedImage.value) {
          tempSelectedImage.value = selectedImage.value;
        }
        
        panelOpen.value = true;
      };
      
      // Select an image in the panel
      const selectImage = (image) => {
        tempSelectedImage.value = image;
      };
      
      // Apply selection and emit update
      const applySelection = () => {
        if (tempSelectedImage.value) {
          selectedImage.value = tempSelectedImage.value;
          emit('update:modelValue', tempSelectedImage.value.id);
        } else {
          selectedImage.value = null;
          emit('update:modelValue', '');
        }
        
        panelOpen.value = false;
      };
      
      // Cancel and close
      const cancelSelection = () => {
        panelOpen.value = false;
      };
      
      // Clear the selection in the panel
      const clearSelection = () => {
        tempSelectedImage.value = null;
      };
      
      // Clear selection and emit update from the main button
      const clearSelectionAndEmit = () => {
        selectedImage.value = null;
        tempSelectedImage.value = null;
        emit('update:modelValue', '');
      };
      
      // Load images on component mount
      onMounted(() => {
        loadAllImages();
      });
      
      return {
        // State
        panelOpen,
        displayMode,
        panelPosition,
        panelSize,
        allImages,
        loading,
        searchQuery,
        tempSelectedImage,
        selectedImage,
        filteredImages,
        
        // Refs
        picsumImageInputContainer,
        imagePreview,
        galleryContainer,
        
        // Methods
        updateDisplayMode,
        updatePanelPosition,
        openPanel,
        selectImage,
        applySelection,
        cancelSelection,
        clearSelection,
        clearSelectionAndEmit
      };
    }
  };
  </script>
  
  <style scoped>
  .picsum-image-input {
    position: relative;
    margin-bottom: 10px;
  }
  
  /* Image Preview Button */
  .image-preview-container {
    display: flex;
    align-items: center;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    background-color: #f5f5f5;
    transition: border-color 0.2s;
    max-width: fit-content;
  }
  
  .image-preview-container:hover {
    border-color: #aaa;
  }
  
  /* Large size variant */
  .image-preview-container.large {
    padding: 12px 8px;
  }
  
  .image-preview {
    width: 80px;
    height: 80px;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #eee;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .selected-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .no-image {
    color: #999;
    font-size: 12px;
    text-align: center;
  }
  
  .image-details {
    display: flex;
    flex-direction: column;
  }
  
  .image-name {
    font-weight: 500;
    margin-bottom: 2px;
  }
  
  .image-info {
    font-size: 12px;
    color: #666;
  }
  
  /* Image Panel Content */
  .image-panel-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    height: 100%;
    overflow: hidden;
  }
  
  /* Gallery Controls */
  .gallery-controls {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
  }
  
  .search-container {
    flex: 1;
  }
  
  .search-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }
  
  /* Selected Image Preview */
  .selected-preview {
    display: flex;
    background-color: #f9f9f9;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 15px;
    gap: 20px;
  }
  
  .preview-image-container {
    width: 400px;
    height: 300px;
    overflow: hidden;
    border-radius: 4px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }
  
  .preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .preview-details {
    flex: 1;
  }
  
  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .preview-header h4 {
    margin: 0;
    font-size: 1.1rem;
    color: #444;
  }
  
  .preview-details p {
    margin: 8px 0;
    color: #555;
  }
  
  /* Image Gallery */
  .image-gallery {
    flex: 1;
    overflow-y: auto;
    padding-right: 5px;
  }
  
  .image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 15px;
    padding-bottom: 20px;
  }
  
  .image-item {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    background-color: white;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .image-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .image-item.selected {
    border-color: #4a8bf5;
    box-shadow: 0 0 0 2px rgba(74, 139, 245, 0.3);
  }
  
  .image-thumbnail-container {
    width: 100%;
    height: 140px;
    overflow: hidden;
  }
  
  .image-thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }
  
  .image-item:hover .image-thumbnail {
    transform: scale(1.05);
  }
  
  .image-caption {
    padding: 8px;
    font-size: 12px;
    color: #666;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background-color: #f9f9f9;
    border-top: 1px solid #eee;
  }
  
  /* Clear buttons */
  .clear-selection-btn {
    background: none;
    border: none;
    color: #999;
    font-size: 20px;
    cursor: pointer;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  
  .clear-selection-btn:hover {
    background-color: #f0f0f0;
    color: #555;
  }
  
  .clear-preview-btn {
    background: none;
    border: none;
    color: #999;
    font-size: 18px;
    cursor: pointer;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    margin-left: 10px;
  }
  
  .clear-preview-btn:hover {
    background-color: #f0f0f0;
    color: #555;
  }
  
  /* Loading and status indicators */
  .loading-indicator, .no-results {
    padding: 40px 20px;
    text-align: center;
    color: #666;
    font-size: 16px;
    background-color: #f9f9f9;
    border-radius: 8px;
    margin: 20px 0;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .selected-preview {
      flex-direction: column;
    }
    
    .preview-image-container {
      width: 100%;
      height: 200px;
    }
    
    .image-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }
  }
  </style>
  