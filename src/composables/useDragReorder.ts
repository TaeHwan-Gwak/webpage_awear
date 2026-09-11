import { ref } from 'vue'

/**
 * Generic drag-to-reorder handlers for a reactive array. Call with the array
 * itself (mutated in place via splice) and a callback that persists the new
 * order (e.g. saveJsonFile).
 */
export function useDragReorder<T>(list: T[], onReordered: () => unknown) {
  const draggedIndex = ref<number | null>(null)
  const overIndex = ref<number | null>(null)

  function onDragStart(index: number) {
    draggedIndex.value = index
  }

  function onDragOver(index: number, e: DragEvent) {
    e.preventDefault()
    overIndex.value = index
  }

  async function onDrop(targetIndex: number) {
    const from = draggedIndex.value
    draggedIndex.value = null
    overIndex.value = null
    if (from === null || from === targetIndex) return

    const [moved] = list.splice(from, 1)
    list.splice(targetIndex, 0, moved)
    await onReordered()
  }

  function onDragEnd() {
    draggedIndex.value = null
    overIndex.value = null
  }

  return { draggedIndex, overIndex, onDragStart, onDragOver, onDrop, onDragEnd }
}
