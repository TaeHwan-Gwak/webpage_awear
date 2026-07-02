import { ref, onMounted } from 'vue'
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore'
import { db } from '../firebase'

export interface NewsItem {
  id: string
  date: string
  desc: string
}

/**
 * Loads up to `max` news items from the Firestore "news" collection,
 * ordered by the `date` field (string, sortable e.g. "2026-04").
 * Returns an empty array if Firebase isn't configured yet or the
 * collection is empty — callers should fall back to static content.
 */
export function useNews(max = 5) {
  const news = ref<NewsItem[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  onMounted(async () => {
    if (!db) {
      loading.value = false
      return
    }
    try {
      const q = query(collection(db, 'news'), orderBy('date', 'desc'), limit(max))
      const snapshot = await getDocs(q)
      news.value = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<NewsItem, 'id'>),
      }))
    } catch (e) {
      error.value = 'news를 불러오지 못했습니다.'
      console.error('[useNews]', e)
    } finally {
      loading.value = false
    }
  })

  return { news, loading, error }
}
