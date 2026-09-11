export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Checks a set of required fields are non-blank. Returns an error message
 * naming the first missing field, or null if everything required is filled.
 */
export function checkRequired(fields: Record<string, string>): string | null {
  for (const [label, value] of Object.entries(fields)) {
    if (!value || !value.trim()) {
      return `${label} is required.`
    }
  }
  return null
}
