import { canEditAdmin } from './useAdminAuth'

/**
 * Reactive admin-mode flag shared across the whole app. Backed by the same
 * module-level token state in useAdminAuth, so every component using this
 * updates together the moment someone logs in or out - no manual refresh needed.
 */
export function useAdminMode() {
  return { isAdmin: canEditAdmin, refresh: () => {} }
}
