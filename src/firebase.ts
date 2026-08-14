import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const isConfigured = Object.values(firebaseConfig).every(Boolean)

export let app: FirebaseApp | undefined
export let db: Firestore | undefined
export let storage: FirebaseStorage | undefined

if (isConfigured) {
  app = initializeApp(firebaseConfig)
  db = getFirestore(app)
  storage = getStorage(app)
} else if (import.meta.env.DEV) {
  console.info(
    '[firebase] .env에 VITE_FIREBASE_* 값이 없어 Firebase 연결을 건너뜁니다. 정적 데이터로 표시됩니다.'
  )
}
