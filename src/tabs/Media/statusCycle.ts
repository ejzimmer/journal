export function nextInCycle<S extends string>(
  order: readonly S[],
  status: S,
): S {
  const index = order.indexOf(status)
  return order[(index + 1) % order.length]
}
