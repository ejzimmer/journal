import { Database, onValue, ref } from "firebase/database"
import { useEffect, useSyncExternalStore } from "react"
import { ContextType } from "../FirebaseContext"
import { createLocalStore } from "./localStore"
import { createOutbox } from "./outbox"
import { pathsAreRelated } from "./pathTree"
import { createSyncEngine } from "./syncEngine"

export function createLocalFirstContext(
  database: Database,
  dbName = "journal-local-first",
): { context: ContextType; hydrate: () => Promise<void> } {
  // Separate IndexedDB databases: idb-keyval's createStore only creates its
  // named object store when the database is first opened, so two stores
  // can't share one db name without an explicit shared upgrade step.
  const localStore = createLocalStore(`${dbName}-local`)
  const outbox = createOutbox(`${dbName}-outbox`)
  const syncEngine = createSyncEngine(database, outbox)
  syncEngine.start()

  const keysWithRemoteListener = new Set<string>()

  function ensureRemoteListener(key: string) {
    if (keysWithRemoteListener.has(key)) return
    keysWithRemoteListener.add(key)

    onValue(ref(database, key), async (snapshot) => {
      const pendingOps = await outbox.list()
      const hasUnsyncedLocalWrite = pendingOps.some((op) =>
        pathsAreRelated(op.path, key),
      )
      // A local write under this key hasn't reached the server yet, so this
      // snapshot predates it - applying it now would overwrite the pending
      // change with stale data. The next snapshot after the outbox drains
      // will reflect our own write instead.
      if (hasUnsyncedLocalWrite) return

      localStore.writePath(key, snapshot.val())
    })
  }

  function write(path: string, value: unknown) {
    localStore.writePath(path, value)
    void outbox.enqueue({ path, value }).then(() => syncEngine.notifyChange())
  }

  const context: ContextType = {
    addItem: (parent, item) => {
      const id = crypto.randomUUID()
      write(`${parent}/${id}`, { ...item, id })
      return id
    },
    updateItem: (parent, item) => {
      const path = item.id ? `${parent}/${item.id}` : parent
      write(path, item)
    },
    deleteItem: (parent, item) => {
      if (!item.id) {
        console.error(
          `deleteItem called with no id, refusing to delete under "${parent}"`,
          item,
        )
        return
      }
      write(`${parent}/${item.id}`, null)
    },
    updateList: (listName, list) => {
      const map = list.reduce(
        (items, item) => {
          items[item.id] = item
          return items
        },
        {} as Record<string, unknown>,
      )
      write(listName, map)
    },
    setValue: (path, value) => {
      write(path, value)
    },
    useValue: <T,>(key?: string) => {
      useEffect(() => {
        if (key) ensureRemoteListener(key)
      }, [key])

      const value = useSyncExternalStore(
        (onChange) => (key ? localStore.subscribe(key, onChange) : () => {}),
        () => (key ? localStore.readPath<T>(key) : undefined),
      )

      if (!key || value === undefined) return { loading: false }
      return { value, loading: false }
    },
  }

  return { context, hydrate: localStore.hydrate }
}
