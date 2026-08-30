export type Tree = Record<string, unknown>

export function getAtPath(root: Tree, path: string): unknown {
  return path
    .split("/")
    .reduce<unknown>(
      (node, segment) => (node as Tree | undefined)?.[segment],
      root,
    )
}

export function cloneDeep<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value)
  }
  return JSON.parse(JSON.stringify(value))
}

// Mirrors Firebase Realtime Database's own semantics: writing null/undefined
// deletes the node, and a node left with no children after a delete
// disappears too, all the way up to (but not including) the root.
export function setAtPath(root: Tree, path: string, value: unknown): Tree {
  const segments = path.split("/")
  const last = segments.pop()!

  const chain: Tree[] = [root]
  for (const segment of segments) {
    const child = chain[chain.length - 1][segment]
    chain.push(typeof child === "object" && child !== null ? (child as Tree) : {})
  }

  const isDelete = value === undefined || value === null
  let node = { ...chain[chain.length - 1] }
  if (isDelete) {
    delete node[last]
  } else {
    node[last] = value
  }

  for (let i = segments.length - 1; i >= 0; i--) {
    const parent = { ...chain[i] }
    if (isDelete && Object.keys(node).length === 0) {
      delete parent[segments[i]]
    } else {
      parent[segments[i]] = node
    }
    node = parent
  }

  return node
}

// Two paths are "related" if a change to one could affect what the other
// resolves to: an exact match, or either path is nested inside the other.
export function pathsAreRelated(a: string, b: string): boolean {
  return a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`)
}
