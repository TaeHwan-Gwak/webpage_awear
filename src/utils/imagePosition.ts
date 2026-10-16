export interface ImagePosition {
  x: number
  y: number
  zoom: number
}

export const DEFAULT_IMAGE_POSITION: ImagePosition = { x: 50, y: 50, zoom: 1 }

/** CSS for an `object-fit: cover` image, panned/zoomed per a saved ImagePosition. */
export function imagePositionStyle(pos?: Partial<ImagePosition> | null) {
  const x = pos?.x ?? 50
  const y = pos?.y ?? 50
  const zoom = pos?.zoom ?? 1
  return {
    objectPosition: `${x}% ${y}%`,
    transform: zoom !== 1 ? `scale(${zoom})` : undefined,
    transformOrigin: `${x}% ${y}%`,
  }
}
