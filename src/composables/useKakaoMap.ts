import { onMounted, onBeforeUnmount, ref, type Ref } from 'vue'

declare global {
  interface Window {
    kakao?: any
  }
}

let scriptPromise: Promise<void> | null = null

function loadKakaoMapsScript(appKey: string): Promise<void> {
  if (window.kakao?.maps) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`
    script.async = true
    script.onload = () => window.kakao.maps.load(() => resolve())
    script.onerror = () => reject(new Error('카카오맵 스크립트를 불러오지 못했습니다.'))
    document.head.appendChild(script)
  })

  return scriptPromise
}

/**
 * Loads the Kakao Maps SDK and renders a map centered on `address`
 * (geocoded at runtime — no hardcoded lat/lng). Falls back gracefully
 * with an `error` code if VITE_KAKAO_MAP_KEY isn't set yet.
 */
export function useKakaoMap(containerRef: Ref<HTMLElement | null>, address: string) {
  const ready = ref(false)
  const error = ref<string | null>(null)
  let map: any = null

  onMounted(async () => {
    const appKey = import.meta.env.VITE_KAKAO_MAP_KEY
    if (!appKey) {
      error.value = 'not-configured'
      return
    }

    try {
      await loadKakaoMapsScript(appKey)
      if (!containerRef.value) return

      const kakao = window.kakao
      const geocoder = new kakao.maps.services.Geocoder()

      geocoder.addressSearch(address, (result: any[], status: string) => {
        if (status !== kakao.maps.services.Status.OK || !result.length) {
          error.value = 'geocode-failed'
          return
        }

        const center = new kakao.maps.LatLng(Number(result[0].y), Number(result[0].x))

        map = new kakao.maps.Map(containerRef.value, {
          center,
          level: 3,
        })

        new kakao.maps.Marker({ position: center, map })
        ready.value = true
      })
    } catch (e) {
      error.value = 'load-failed'
      console.error('[useKakaoMap]', e)
    }
  })

  onBeforeUnmount(() => {
    map = null
  })

  return { ready, error }
}
