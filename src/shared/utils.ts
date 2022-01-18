export function updateInPlace<T>(list: T[], index: number, item: T) {
  if (index > -1) {
    list[index] = item
    return [...list]
  }

  return list
}
