
const STORAGE_KEY = 'awear-admin-auth'

export function isAdminAuthenticated(): boolean {
  return sessionStorage.getItem(STORAGE_KEY) === 'true'
}

export function loginAdmin(password: string): boolean {
  const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD

  if (!correctPassword) {
    console.warn('[admin] .env에 VITE_ADMIN_PASSWORD가 설정되지 않았습니다.')
    return false
  }

  if (password === correctPassword) {
    sessionStorage.setItem(STORAGE_KEY, 'true')
    return true
  }

  return false
}

export function logoutAdmin(): void {
  sessionStorage.removeItem(STORAGE_KEY)
}
