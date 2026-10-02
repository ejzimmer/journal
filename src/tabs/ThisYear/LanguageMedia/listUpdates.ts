export const removeItemAt = <T>(items: T[] | undefined, index: number) =>
  items?.filter((_, itemIndex) => itemIndex !== index);

export const replaceItemAt = <T>(
  items: T[] | undefined,
  index: number,
  item: T,
) => items?.with(index, item);
