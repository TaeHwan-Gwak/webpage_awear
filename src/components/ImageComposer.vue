<template>
  <div v-if="open" class="composer-backdrop" @click.self="$emit('cancel')">
    <div class="composer-modal">
      <h3>Arrange images</h3>
      <p class="hint">Drag to move. Drag the corner handle to resize. Anything outside the frame is cropped away.
        Each image is kept as its own file - only the layout is saved.</p>

      <div class="canvas-wrap">
        <canvas ref="canvasEl" :width="outputWidth" :height="outputHeight" @mousedown="onPointerDown"
          @touchstart.prevent="onPointerDown" />
      </div>

      <div class="composer-toolbar">
        <label class="add-layer-btn" :class="{ disabled: layers.length >= maxLayers }">
          + Add {{ layers.length ? 'another' : 'an' }} image
          <input type="file" accept="image/*" :disabled="layers.length >= maxLayers" @change="onAddLayer" />
        </label>
        <button v-if="activeIndex !== null" type="button" class="remove-layer-btn" @click="removeActiveLayer">
          Remove selected image
        </button>
        <span v-if="layers.length" class="layer-hint">Click an image to select it, then use the corner handle to
          resize.</span>
      </div>

      <div class="composer-actions">
        <button type="button" class="use-btn" @click="useLayers">Use this layout</button>
        <button type="button" class="cancel-btn" @click="$emit('cancel')">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'

interface LayerInput {
  src: string
  x: number
  y: number
  width: number
  height: number
}

const props = withDefaults(
  defineProps<{
    open: boolean
    /** A freshly picked file to load as the first layer, when opened. */
    initialFile?: File | null
    /** Existing saved layers (their own files + saved position, as fractions of the frame) to re-edit. */
    initialLayers?: LayerInput[]
    /** width / height of the output frame. 1 = square, 4/3 = landscape, etc. */
    aspectRatio?: number
    /** Max number of images that can be arranged at once. */
    maxLayers?: number
  }>(),
  { aspectRatio: 1, initialFile: null, initialLayers: () => [], maxLayers: 2 }
)

export interface LayerResult {
  /** Present when this layer's file is unchanged - just save the new position. */
  src?: string
  /** Present when this layer needs uploading (a freshly added image). */
  blob?: Blob
  ext?: string
  x: number
  y: number
  width: number
  height: number
}

const emit = defineEmits<{
  /** layers to save (in order), and the src of any existing layer the person removed. */
  use: [layers: LayerResult[], removedSrcs: string[]]
  cancel: []
}>()

const OUTPUT_BASE = 1000
const outputWidth = OUTPUT_BASE
const outputHeight = Math.round(OUTPUT_BASE / props.aspectRatio)

interface Layer {
  img: HTMLImageElement
  x: number
  y: number
  width: number
  height: number
  existingSrc?: string
  file?: File
}

const canvasEl = ref<HTMLCanvasElement | null>(null)
const layers = ref<Layer[]>([])
const activeIndex = ref<number | null>(null)
const removedSrcs = ref<string[]>([])

const HANDLE_SIZE = 28

type DragMode = { kind: 'move' | 'resize'; index: number; startX: number; startY: number; layer: Layer }
let dragMode: DragMode | null = null

function loadImageFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function loadImageUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    // cache-bust so re-editing right after a save shows the latest saved file, not a stale cached one
    img.src = url.includes('?') ? url : `${url}?t=${Date.now()}`
  })
}

function fitLayer(img: HTMLImageElement): { x: number; y: number; width: number; height: number } {
  // Fit the image so its longer side lands exactly on the frame edge (like
  // object-fit: contain), centered - the whole image starts visible.
  const scale = Math.min(outputWidth / img.width, outputHeight / img.height)
  const width = img.width * scale
  const height = img.height * scale
  return { width, height, x: (outputWidth - width) / 2, y: (outputHeight - height) / 2 }
}

async function addLayerFromFile(file: File) {
  const img = await loadImageFile(file)
  layers.value.push({ img, file, ...fitLayer(img) })
  activeIndex.value = layers.value.length - 1
  draw()
}

async function addLayerFromExisting(input: LayerInput) {
  const img = await loadImageUrl(input.src)
  layers.value.push({
    img,
    existingSrc: input.src,
    x: input.x * outputWidth,
    y: input.y * outputHeight,
    width: input.width * outputWidth,
    height: input.height * outputHeight,
  })
}

async function onAddLayer(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || layers.value.length >= props.maxLayers) return
  await addLayerFromFile(file)
}

function removeActiveLayer() {
  if (activeIndex.value === null) return
  const layer = layers.value[activeIndex.value]
  if (layer.existingSrc) removedSrcs.value.push(layer.existingSrc)
  layers.value.splice(activeIndex.value, 1)
  activeIndex.value = null
  draw()
}

function draw(showChrome = true) {
  const canvas = canvasEl.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, outputWidth, outputHeight)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, outputWidth, outputHeight)

  layers.value.forEach((layer, i) => {
    ctx.drawImage(layer.img, layer.x, layer.y, layer.width, layer.height)
    if (showChrome && i === activeIndex.value) {
      ctx.strokeStyle = '#ff5a1f'
      ctx.lineWidth = 3
      ctx.strokeRect(layer.x, layer.y, layer.width, layer.height)
      // resize handle, bottom-right corner
      ctx.fillStyle = '#ff5a1f'
      ctx.fillRect(layer.x + layer.width - HANDLE_SIZE / 2, layer.y + layer.height - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE)
    }
  })
}

function toCanvasCoords(e: MouseEvent | TouchEvent): { x: number; y: number } {
  const canvas = canvasEl.value!
  const rect = canvas.getBoundingClientRect()
  const point = 'touches' in e ? e.touches[0] : e
  const scaleX = outputWidth / rect.width
  const scaleY = outputHeight / rect.height
  return {
    x: (point.clientX - rect.left) * scaleX,
    y: (point.clientY - rect.top) * scaleY,
  }
}

function hitTestHandle(layer: Layer, x: number, y: number): boolean {
  const hx = layer.x + layer.width - HANDLE_SIZE / 2
  const hy = layer.y + layer.height - HANDLE_SIZE / 2
  return x >= hx - HANDLE_SIZE / 2 && x <= hx + HANDLE_SIZE && y >= hy - HANDLE_SIZE / 2 && y <= hy + HANDLE_SIZE
}

function hitTestLayer(layer: Layer, x: number, y: number): boolean {
  return x >= layer.x && x <= layer.x + layer.width && y >= layer.y && y <= layer.y + layer.height
}

function onPointerDown(e: MouseEvent | TouchEvent) {
  e.preventDefault()
  const { x, y } = toCanvasCoords(e)

  // Check the active layer's resize handle first.
  if (activeIndex.value !== null) {
    const layer = layers.value[activeIndex.value]
    if (layer && hitTestHandle(layer, x, y)) {
      dragMode = { kind: 'resize', index: activeIndex.value, startX: x, startY: y, layer: { ...layer } }
      attachMoveListeners()
      return
    }
  }

  // Otherwise, pick the topmost layer under the pointer.
  for (let i = layers.value.length - 1; i >= 0; i--) {
    if (hitTestLayer(layers.value[i], x, y)) {
      activeIndex.value = i
      dragMode = { kind: 'move', index: i, startX: x, startY: y, layer: { ...layers.value[i] } }
      attachMoveListeners()
      draw()
      return
    }
  }

  activeIndex.value = null
  draw()
}

function onPointerMove(e: MouseEvent | TouchEvent) {
  if (!dragMode) return
  const { x, y } = toCanvasCoords(e)
  const dx = x - dragMode.startX
  const dy = y - dragMode.startY
  const layer = layers.value[dragMode.index]
  if (!layer) return

  if (dragMode.kind === 'move') {
    layer.x = dragMode.layer.x + dx
    layer.y = dragMode.layer.y + dy
  } else {
    // Resize from the corner, keeping the image's own aspect ratio.
    const ratio = dragMode.layer.width / dragMode.layer.height
    const newWidth = Math.max(40, dragMode.layer.width + dx)
    layer.width = newWidth
    layer.height = newWidth / ratio
  }
  draw()
}

function onPointerUp() {
  dragMode = null
  detachMoveListeners()
}

function attachMoveListeners() {
  window.addEventListener('mousemove', onPointerMove)
  window.addEventListener('mouseup', onPointerUp)
  window.addEventListener('touchmove', onPointerMove, { passive: false })
  window.addEventListener('touchend', onPointerUp)
}

function detachMoveListeners() {
  window.removeEventListener('mousemove', onPointerMove)
  window.removeEventListener('mouseup', onPointerUp)
  window.removeEventListener('touchmove', onPointerMove)
  window.removeEventListener('touchend', onPointerUp)
}

onBeforeUnmount(detachMoveListeners)

function detectExt(file: File): string {
  const fromName = file.name.split('.').pop()
  if (fromName && fromName.length <= 5) return fromName.toLowerCase()
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  return 'jpg'
}

function useLayers() {
  const results: LayerResult[] = layers.value.map((layer) => {
    const x = layer.x / outputWidth
    const y = layer.y / outputHeight
    const width = layer.width / outputWidth
    const height = layer.height / outputHeight

    if (layer.existingSrc) {
      return { src: layer.existingSrc, x, y, width, height }
    }
    return { blob: layer.file!, ext: detectExt(layer.file!), x, y, width, height }
  })

  emit('use', results, removedSrcs.value)
}

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) {
      dragMode = null
      detachMoveListeners()
      return
    }
    layers.value = []
    activeIndex.value = null
    removedSrcs.value = []
    dragMode = null
    await nextTick()
    if (props.initialLayers.length) {
      for (const input of props.initialLayers) {
        await addLayerFromExisting(input)
      }
      activeIndex.value = null
      draw()
    } else if (props.initialFile) {
      await addLayerFromFile(props.initialFile)
    } else {
      draw()
    }
  },
  { immediate: true }
)
</script>

<style src="./styles/ImageComposer.css" scoped></style>
