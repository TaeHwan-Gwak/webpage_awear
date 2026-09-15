const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean)

let dbPromise: Promise<import('firebase/firestore').Firestore> | undefined

/**
 * Lazily loads the Firebase SDK and returns a Firestore instance, only when
 * VITE_FIREBASE_* is actually configured. Dynamic imports keep the ~450KB SDK
 * out of everyone's bundle until it's genuinely needed.
 */
export function getDb() {
  if (!isFirebaseConfigured) {
    if (import.meta.env.DEV) {
      console.info(
        '[firebase] Skipping Firebase connection because VITE_FIREBASE_* values are missing in .env. Falling back to static data.'
      )
    }
    return undefined
  }

  if (!dbPromise) {
    dbPromise = (async () => {
      const { initializeApp } = await import('firebase/app')
      const { getFirestore } = await import('firebase/firestore')
      const app = initializeApp(firebaseConfig)
      return getFirestore(app)
    })()
  }

  return dbPromise
}
