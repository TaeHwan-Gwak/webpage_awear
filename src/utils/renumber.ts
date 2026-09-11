import { renameImage } from '../services/localSave'

interface IdChange {
  oldId: string
  newId: string
}

/**
 * Reassigns every item's id to `${prefix}${position+1}` based on its current
 * array position. Returns the list of ids that actually changed, so callers
 * can rename any files (photos, images) that were named after the old id.
 */
export function renumberIds<T extends { id: string }>(list: T[], prefix: string): IdChange[] {
  const changes: IdChange[] = []
  list.forEach((item, i) => {
    const newId = `${prefix}${i + 1}`
    if (item.id !== newId) {
      changes.push({ oldId: item.id, newId })
      item.id = newId
    }
  })
  return changes
}

/**
 * For a single-image field (e.g. member.photo, news.image) named "<oldId>.<ext>",
 * renames the file to "<newId>.<ext>" and updates the field in place.
 */
export async function renameSingleImageField<T extends { id: string } & Record<string, unknown>>(
  list: T[],
  changes: IdChange[],
  field: string
): Promise<void> {
  for (const { oldId, newId } of changes) {
    const item = list.find((i) => i.id === newId)
    const src = item?.[field] as string | undefined
    if (!item || !src) continue

    const match = /^(\/[^/]+\/)([^/]+)\.(\w+)$/.exec(src)
    if (!match || match[2] !== oldId) continue

    const newPath = `${match[1]}${newId}.${match[3]}`
    const ok = await renameImage(src, newPath)
    if (ok) (item as Record<string, unknown>)[field] = newPath
  }
}

/**
 * For a multi-image field (e.g. publication.images) named "<oldId>-1.<ext>",
 * "<oldId>-2.<ext>", ..., renames each file to use the new id and updates
 * the array in place.
 */
export async function renameMultiImageField<T extends { id: string; images?: string[] }>(
  list: T[],
  changes: IdChange[]
): Promise<void> {
  for (const { oldId, newId } of changes) {
    const item = list.find((i) => i.id === newId)
    if (!item?.images?.length) continue

    const renamed: string[] = []
    for (const src of item.images) {
      const match = /^(\/[^/]+\/)([^/]+)-(\d+)\.(\w+)$/.exec(src)
      if (!match || match[2] !== oldId) {
        renamed.push(src)
        continue
      }
      const newPath = `${match[1]}${newId}-${match[3]}.${match[4]}`
      const ok = await renameImage(src, newPath)
      renamed.push(ok ? newPath : src)
    }
    item.images = renamed
  }
}
