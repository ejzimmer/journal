import { useEffect, useRef, useState } from "react"
import { ContextType } from "./FirebaseContext"

function getAtPath(root: Record<string, unknown>, path: string): unknown {
  return path
    .split("/")
    .reduce<unknown>(
      (node, segment) =>
        (node as Record<string, unknown> | undefined)?.[segment],
      root,
    )
}

function cloneDeep<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value)
  }
  return JSON.parse(JSON.stringify(value))
}

function setAtPath(
  root: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> {
  const segments = path.split("/")
  const last = segments.pop()!

  const chain: Record<string, unknown>[] = [root]
  for (const segment of segments) {
    const child = chain[chain.length - 1][segment]
    chain.push(
      typeof child === "object" && child !== null
        ? (child as Record<string, unknown>)
        : {},
    )
  }

  const isDelete = value === undefined || value === null
  let node = { ...chain[chain.length - 1] }
  if (isDelete) {
    delete node[last]
  } else {
    node[last] = value
  }

  // Firebase's Realtime Database doesn't store empty nodes: an object left
  // with no children after a delete disappears too, same as its parents,
  // all the way up.
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

export function createMockFirebaseContext(
  seed: Record<string, unknown> = {},
): ContextType {
  let data: Record<string, unknown> = cloneDeep(seed)
  const listeners = new Map<string, Set<() => void>>()
  let nextId = 1

  const write = (path: string, value: unknown) => {
    data = setAtPath(data, path, value)
  }

  const notify = (changedPath: string) => {
    listeners.forEach((subscribers, key) => {
      const related =
        key === changedPath ||
        key.startsWith(`${changedPath}/`) ||
        changedPath.startsWith(`${key}/`)
      if (related) subscribers.forEach((notifySubscriber) => notifySubscriber())
    })
  }

  const subscribe = (key: string, onChange: () => void) => {
    if (!listeners.has(key)) listeners.set(key, new Set())
    listeners.get(key)!.add(onChange)
    return () => {
      listeners.get(key)?.delete(onChange)
    }
  }

  return {
    addItem<T>(parent: string, item: Omit<T, "id">) {
      const id = `mock-${nextId++}`
      write(`${parent}/${id}`, { ...item, id })
      notify(parent)
      return id
    },
    updateItem<T extends { id: string }>(parent: string, item: T) {
      const path = item.id ? `${parent}/${item.id}` : parent
      write(path, item)
      notify(path)
    },
    deleteItem<T extends { id: string }>(parent: string, item: T) {
      if (!item.id) {
        console.error(
          `deleteItem called with no id, refusing to delete under "${parent}"`,
          item,
        )
        return
      }
      const path = `${parent}/${item.id}`
      if (getAtPath(data, path) === undefined) {
        console.error(
          `deleteItem found nothing at "${path}" - nothing will be deleted`,
          item,
        )
      }
      write(path, undefined)
      notify(parent)
    },
    updateList<T extends { id: string }>(listName: string, list: T[]) {
      const map = list.reduce(
        (items, item) => {
          items[item.id] = item
          return items
        },
        {} as Record<string, T>,
      )
      write(listName, map)
      notify(listName)
    },
    setValue<T>(path: string, value: T) {
      write(path, value)
      notify(path)
    },
    useValue<T>(key?: string) {
      const [result, setResult] = useState<{ value?: T; loading: boolean }>({
        loading: true,
      })
      // Real Firebase's onValue only invokes its callback when the resolved
      // value actually differs from what it last delivered.
      const lastDelivered = useRef<{ initialized: boolean; json?: string }>({
        initialized: false,
      })

      useEffect(() => {
        if (!key) return
        lastDelivered.current = { initialized: false }

        const read = () => {
          const value = getAtPath(data, key) as T | undefined
          const serialized =
            value === undefined || value === null
              ? undefined
              : JSON.stringify(value)
          if (
            lastDelivered.current.initialized &&
            serialized === lastDelivered.current.json
          ) {
            return
          }
          lastDelivered.current = { initialized: true, json: serialized }

          if (value !== undefined && value !== null) {
            setResult({ value, loading: false })
          } else {
            setResult({ loading: false })
          }
        }

        read()
        return subscribe(key, read)
      }, [key])

      return result
    },
  } satisfies ContextType
}
