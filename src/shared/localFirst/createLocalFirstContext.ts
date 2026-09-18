import { Database, onValue, ref } from "firebase/database"
import { useEffect, useSyncExternalStore } from "react"
import { ContextType } from "../FirebaseContext"
import { createLocalStore } from "./localStore"
import { createOutbox, opsTouchPath } from "./outbox"
import { createSyncEngine } from "./syncEngine"

export function createLocalFirstContext(
  database: Database,
  dbName = "journal-local-first",
): { context: ContextType; hydrate: () => Promise<void> } {
  const localStore = createLocalStore(`${dbName}-local`)
  const outbox = createOutbox(`${dbName}-outbox`)
  const syncEngine = createSyncEngine(database, outbox)
  syncEngine.start()

  const keysWithRemoteListener = new Set<string>()

  function registerRemoteListener(key: string) {
    if (keysWithRemoteListener.has(key)) {
      return
    }
    keysWithRemoteListener.add(key)

    onValue(ref(database, key), async (snapshot) => {
      const pendingOps = await outbox.list()
      if (opsTouchPath(pendingOps, key)) {
        return
      }

      localStore.writePath(key, snapshot.val())
    })
  }

  function write(updates: Record<string, unknown>) {
    Object.entries(updates).forEach(([path, value]) =>
      localStore.writePath(path, value),
    )
    void outbox.enqueue({ updates }).then(() => syncEngine.notifyChange())
  }

  const context: ContextType = {
    addItem: (parent, item) => {
      const id = crypto.randomUUID()
      write({ [`${parent}/${id}`]: { ...item, id } })
      return id
    },
    updateItem: (parent, item) => {
      const path = item.id ? `${parent}/${item.id}` : parent
      write({ [path]: item })
    },
    deleteItem: (parent, item) => {
      if (!item.id) {
        console.error(
          `deleteItem called with no id, refusing to delete under "${parent}"`,
          item,
        )
        return
      }
      write({ [`${parent}/${item.id}`]: null })
    },
    updateList: (listName, list) => {
      const map = list.reduce(
        (items, item) => {
          items[item.id] = item
          return items
        },
        {} as Record<string, unknown>,
      )
      write({ [listName]: map })
    },
    setValue: (path, value) => {
      write({ [path]: value })
    },
    moveItemBetweenLists: ({
      movedItem,
      sourceListId,
      targetListId,
      targetListItems = [],
    }) => {
      const updates: Record<string, unknown> = {
        [`${targetListId}/${movedItem.id}`]: movedItem,
        [`${sourceListId}/${movedItem.id}`]: null,
      }
      targetListItems.forEach((existingItem) => {
        updates[`${targetListId}/${existingItem.id}/position`] =
          existingItem.position < movedItem.position
            ? existingItem.position
            : existingItem.position + 1
      })
      write(updates)
    },
    useValue: <T,>(key?: string) => {
      useEffect(() => {
        if (key) registerRemoteListener(key)
      }, [key])

      const value = useSyncExternalStore(
        (onChange) => (key ? localStore.subscribe(key, onChange) : () => {}),
        () => (key ? localStore.readPath<T>(key) : undefined),
      )

      return { value, loading: false }
    },
  }

  return { context, hydrate: localStore.hydrate }
}
