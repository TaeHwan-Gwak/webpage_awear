<template>
  <div v-if="open" class="pos-editor-backdrop" @click.self="$emit('cancel')">
    <div class="pos-editor-modal">
      <h3>Adjust photo</h3>
      <p class="hint">Drag the photo to reposition it, and use the slider to zoom in.</p>

      <div ref="frameEl" class="frame" :class="{ round }" :style="{ aspectRatio }" @mousedown="onPointerDown"
        @touchstart.prevent="onPointerDown">
        <img ref="imgEl" :src="src" alt="" draggable="false" :style="imgStyle" @load="onImageLoad" />
      </div>

      <label class="zoom-row">
        <span>Zoom</span>
        <input type="range" min="1" max="3" step="0.02" v-model.number="zoom" />
      </label>

      <div class="actions">
        <button type="button" class="reset-btn" @click="reset">Reset</button>
        <div class="spacer" />
        <button type="button" class="cancel-btn" @click="$emit('cancel')">Cancel</button>
        <button type="button" class="save-btn" @click="save">Save</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import type { ImagePosition } from '../utils/imagePosition'

const props = withDefaults(
  defineProps<{
    open: boolean
    src: string
    /** width / height of the frame - e.g. 1 for a square avatar, 4/3 for a gallery tile. */
    aspectRatio?: number
    initial?: ImagePosition
    /** Show the frame as a circle (member avatars). */
    round?: boolean
  }>(),
  { aspectRatio: 1, round: false }
)

const emit = defineEmits<{
  save: [pos: ImagePosition]
  cancel: []
}>()

const x = ref(50)
const y = ref(50)
const zoom = ref(1)

watch(
  () => [props.open, props.initial] as const,
  ([isOpen, initial]) => {
    if (!isOpen) return
    x.value = initial?.x ?? 50
    y.value = initial?.y ?? 50
    zoom.value = initial?.zoom ?? 1
  },
  { immediate: true }
)

const imgStyle = computed(() => ({
  width: '100%',
  height: '100%',
  objectFit: 'cover' as const,
  objectPosition: `${x.value}% ${y.value}%`,
  transform: `scale(${zoom.value})`,
  transformOrigin: `${x.value}% ${y.value}%`,
}))

const frameEl = ref<HTMLElement | null>(null)
const imgEl = ref<HTMLImageElement | null>(null)

function onImageLoad() {
  // Nothing to precompute - overflow is measured fresh on each drag start.
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

function computeOverflow() {
  const frame = frameEl.value
  const img = imgEl.value
  if (!frame || !img || !img.naturalWidth || !img.naturalHeight) {
    return { overflowX: 0, overflowY: 0 }
  }
  const rect = frame.getBoundingClientRect()
  // object-fit: cover's own scale, before our extra zoom on top of it.
  const coverScale = Math.max(rect.width / img.naturalWidth, rect.height / img.naturalHeight)
  const renderWidth = img.naturalWidth * coverScale * zoom.value
  const renderHeight = img.naturalHeight * coverScale * zoom.value
  return {
    overflowX: Math.max(0, renderWidth - rect.width),
    overflowY: Math.max(0, renderHeight - rect.height),
  }
}

type DragState = { startX: number; startY: number; fromX: number; fromY: number; overflowX: number; overflowY: number }
let drag: DragState | null = null

function pointOf(e: MouseEvent | TouchEvent) {
  return 'touches' in e ? e.touches[0] : e
}

function onPointerDown(e: MouseEvent | TouchEvent) {
  e.preventDefault()
  const point = pointOf(e)
  if (!point) return
  const { overflowX, overflowY } = computeOverflow()
  drag = { startX: point.clientX, startY: point.clientY, fromX: x.value, fromY: y.value, overflowX, overflowY }
  window.addEventListener('mousemove', onPointerMove)
  window.addEventListener('mouseup', onPointerUp)
  window.addEventListener('touchmove', onPointerMove, { passive: false })
  window.addEventListener('touchend', onPointerUp)
}

function onPointerMove(e: MouseEvent | TouchEvent) {
  if (!drag) return
  e.preventDefault()
  const point = pointOf(e)
  if (!point) return
  const dx = point.clientX - drag.startX
  const dy = point.clientY - drag.startY
  // Natural "drag the photo" feel: moving the pointer left reveals more of
  // the image's right side, so the object-position percentage moves the
  // opposite way from the pointer.
  x.value = drag.overflowX > 0 ? clamp(drag.fromX - (dx / drag.overflowX) * 100, 0, 100) : 50
  y.value = drag.overflowY > 0 ? clamp(drag.fromY - (dy / drag.overflowY) * 100, 0, 100) : 50
}

function onPointerUp() {
  drag = null
  window.removeEventListener('mousemove', onPointerMove)
  window.removeEventListener('mouseup', onPointerUp)
  window.removeEventListener('touchmove', onPointerMove)
  window.removeEventListener('touchend', onPointerUp)
}

onBeforeUnmount(onPointerUp)

function reset() {
  x.value = 50
  y.value = 50
  zoom.value = 1
}

function save() {
  emit('save', { x: x.value, y: y.value, zoom: zoom.value })
}
</script>

<style scoped>
.pos-editor-backdrop {
  position: fixed;
  inset: 0;
  z-index: 130;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(32, 24, 16, 0.32);
  padding: 24px;
}

.pos-editor-modal {
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 28px;
  border-radius: 14px;
  background: var(--bg);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

h3 {
  font-size: 18px;
}

.hint {
  font-size: 13px;
  color: var(--text-muted);
  margin: -8px 0 0;
}

.frame {
  width: 100%;
  overflow: hidden;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface);
  cursor: grab;
  touch-action: none;
  user-select: none;

  &:active {
    cursor: grabbing;
  }

  &.round {
    border-radius: 50%;
  }

  img {
    display: block;
    pointer-events: none;
  }
}

.zoom-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: var(--text-muted);

  input[type='range'] {
    flex: 1;
  }
}

.actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.spacer {
  flex: 1;
}

.reset-btn,
.cancel-btn,
.save-btn {
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
}

.reset-btn {
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text-muted);

  &:hover {
    border-color: var(--text-muted);
    color: var(--text);
  }
}

.cancel-btn {
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text-muted);

  &:hover {
    border-color: var(--text-muted);
    color: var(--text);
  }
}

.save-btn {
  border: none;
  background: var(--orange);
  color: #fff;

  &:hover {
    background: var(--orange-deep);
  }
}
</style>
