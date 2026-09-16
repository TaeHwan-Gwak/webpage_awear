import { onMounted, onUnmounted, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import type { NavigationGuardNext } from 'vue-router'

export function useLeaveGuard(isDirty: () => boolean, onSave: () => Promise<boolean>, onDiscard: () => void) {
  const showLeaveModal = ref(false)
  let pendingNext: NavigationGuardNext | null = null

  onBeforeRouteLeave((_to, _from, next) => {
    if (!isDirty()) {
      next()
      return
    }
    pendingNext = next
    showLeaveModal.value = true
  })

  // Also warn on closing the tab/window - browsers show their own native
  // prompt here, our custom modal can't run in that case.
  function onBeforeUnload(e: BeforeUnloadEvent) {
    if (isDirty()) {
      e.preventDefault()
    }
  }
  onMounted(() => window.addEventListener('beforeunload', onBeforeUnload))
  onUnmounted(() => window.removeEventListener('beforeunload', onBeforeUnload))

  async function saveAndLeave() {
    const ok = await onSave()
    showLeaveModal.value = false
    if (ok) pendingNext?.()
    else pendingNext?.(false)
    pendingNext = null
  }

  function discardAndLeave() {
    onDiscard()
    showLeaveModal.value = false
    pendingNext?.()
    pendingNext = null
  }

  function stay() {
    showLeaveModal.value = false
    pendingNext?.(false)
    pendingNext = null
  }

  return { showLeaveModal, saveAndLeave, discardAndLeave, stay }
}
