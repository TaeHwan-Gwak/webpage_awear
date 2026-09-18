import { uploadImage, deleteImage, type ImageFolder } from '../services/localSave'

interface QueuedUpload {
  folder: ImageFolder
  filename: string
  blob: Blob
}

/**
 * Defers actual file uploads/deletes until `flush()` is called (page-level Save).
 * `queueUpload` returns an immediate local preview URL (a blob: URL) so the UI
 * can show the edit right away, without touching disk yet. `discard()` (page-level
 * Cancel) throws everything away untouched - nothing was ever written or deleted.
 */
export function usePendingUploads() {
  const pendingUploads = new Map<string, QueuedUpload>() // keyed by the blob: preview URL
  const pendingDeletes = new Set<string>() // real saved paths to delete on flush

  /** Queues an upload, returning a blob: URL to use as the preview immediately. */
  function queueUpload(folder: ImageFolder, filename: string, blob: Blob): string {
    const previewUrl = URL.createObjectURL(blob)
    pendingUploads.set(previewUrl, { folder, filename, blob })
    return previewUrl
  }

  /**
   * Queues removal of a saved image. If the path is actually a not-yet-flushed
   * preview (blob: URL), there's nothing on disk yet - just drop it.
   */
  function queueDelete(path?: string | null) {
    if (!path) return
    if (pendingUploads.has(path)) {
      URL.revokeObjectURL(path)
      pendingUploads.delete(path)
    } else if (path.startsWith('/')) {
      pendingDeletes.add(path)
    }
  }

  /** If `path` is a not-yet-flushed pending upload, returns its target {folder, filename}. */
  function getPendingTarget(path: string): { folder: ImageFolder; filename: string } | undefined {
    const item = pendingUploads.get(path)
    return item ? { folder: item.folder, filename: item.filename } : undefined
  }

  /** Performs every queued upload/delete for real. Returns preview URL -> final saved path. */
  async function flush(): Promise<Map<string, string>> {
    const resolved = new Map<string, string>()

    for (const [previewUrl, item] of pendingUploads) {
      const path = await uploadImage(item.folder, item.filename, item.blob)
      if (path) resolved.set(previewUrl, path)
      URL.revokeObjectURL(previewUrl)
    }
    pendingUploads.clear()

    for (const path of pendingDeletes) {
      await deleteImage(path)
    }
    pendingDeletes.clear()

    return resolved
  }

  /** Throws away everything queued without touching the filesystem at all. */
  function discard() {
    for (const url of pendingUploads.keys()) URL.revokeObjectURL(url)
    pendingUploads.clear()
    pendingDeletes.clear()
  }

  return { queueUpload, queueDelete, getPendingTarget, flush, discard }
}
