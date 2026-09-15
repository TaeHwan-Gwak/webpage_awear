import { onMounted, onUnmounted } from 'vue'

export function useEscapeKey(onEscape: () => void) {
  function handler(e: KeyboardEvent) {
    if (e.key === 'Escape') onEscape()
  }

  onMounted(() => window.addEventListener('keydown', handler))
  onUnmounted(() => window.removeEventListener('keydown', handler))
}
