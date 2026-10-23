export function findMovedIds(
  myOrder: string[],
  theirOrder: string[],
): Set<string> {
  const unmoved = findLongestCommonSubsequence(myOrder, theirOrder);
  return new Set(myOrder.filter((id) => !unmoved.has(id)));
}

function findLongestCommonSubsequence(a: string[], b: string[]): Set<string> {
  const lengths = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lengths[i][j] =
        a[i] === b[j]
          ? lengths[i + 1][j + 1] + 1
          : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
    }
  }

  const common = new Set<string>();
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      common.add(a[i]);
      i++;
      j++;
    } else if (lengths[i + 1][j] >= lengths[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }
  return common;
}
