import { ref, onMounted } from 'vue'
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore'
import { db } from '../firebase'

export interface NewsItem {
  id: string
  date: string
  desc: string
  tag?: string
  link?: string
  image?: string
}

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
