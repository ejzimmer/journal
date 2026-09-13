const COVER_HUES = [25, 58, 145, 185, 232, 268, 305, 345]

export function getCoverHue(key: string): number {
  let hash = 0
  for (let index = 0; index < key.length; index++) {
    hash = (hash * 31 + key.charCodeAt(index)) | 0
  }
  return COVER_HUES[Math.abs(hash) % COVER_HUES.length]
}
