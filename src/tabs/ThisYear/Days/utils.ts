export const toggleListItem = (list: string[] | undefined, item: string) => {
  if (!list) {
    return [item]
  } else if (list.includes(item)) {
    return list.filter((h) => h !== item)
  } else {
    return [...list, item]
  }
}
