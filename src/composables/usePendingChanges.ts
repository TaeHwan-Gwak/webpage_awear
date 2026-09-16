import { ref, computed } from 'vue'

/**
 * Generic "unsaved changes" tracker. Works by JSON-snapshotting the state
 * right after load/save, then comparing against that snapshot to detect
 * changes - no need to manually mark "dirty" at every mutation call site.
 *
 * - `getState()` should return the current editable state (plain JSON-able data).
 * - `saveFn(state)` persists it (e.g. saveJsonFile) and should resolve to true/false.
 *
 * `save()` and `cancel()` both return the relevant state - callers apply it
 * back into their own reactive object/array/ref however fits their shape.
 */
export function usePendingChanges<T>(getState: () => T, saveFn: (state: T) => Promise<boolean>) {
  const savedSnapshot = ref(JSON.stringify(getState()))
  const isSaving = ref(false)

  const isDirty = computed(() => JSON.stringify(getState()) !== savedSnapshot.value)

  async function save(): Promise<boolean> {
    isSaving.value = true
    const ok = await saveFn(getState())
    isSaving.value = false
    if (ok) savedSnapshot.value = JSON.stringify(getState())
    return ok
  }

  function cancel(): T {
    return JSON.parse(savedSnapshot.value) as T
  }

  /** Call after externally resetting the state (e.g. right after a successful save elsewhere). */
  function markClean() {
    savedSnapshot.value = JSON.stringify(getState())
  }

  return { isDirty, isSaving, save, cancel, markClean }
}
