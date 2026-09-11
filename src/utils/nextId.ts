/**
 * Given a list of existing ids like ["g1", "g2", "g12"], returns the next one
 * in sequence ("g13") using the same letter prefix. Falls back to
 * `${fallbackPrefix}1` when the list is empty or nothing matches the pattern.
 */
export function nextSequentialId(ids: string[], fallbackPrefix: string): string {
  const pattern = /^([a-zA-Z]+)(\d+)$/

  const first = ids.length > 0 ? pattern.exec(ids[0]) : null
  const prefix = first ? first[1] : fallbackPrefix

  let maxNum = 0
  for (const id of ids) {
    const match = pattern.exec(id)
    if (match && match[1] === prefix) {
      maxNum = Math.max(maxNum, parseInt(match[2], 10))
    }
  }

  return `${prefix}${maxNum + 1}`
}
