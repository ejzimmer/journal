import { Database, ref, update } from "firebase/database"
import { Outbox } from "./outbox"

const INITIAL_BACKOFF_MS = 1000
const MAX_BACKOFF_MS = 30000

export type SyncEngine = {
  start: () => void
  notifyChange: () => void
}

export function createSyncEngine(
  database: Database,
  outbox: Outbox,
): SyncEngine {
  let draining = false
  let retryTimer: ReturnType<typeof setTimeout> | undefined
  let backoffMs = INITIAL_BACKOFF_MS

  async function drain() {
    if (draining) return
    draining = true

    try {
      while (typeof navigator === "undefined" || navigator.onLine) {
        const [next] = await outbox.list()
        if (!next) return

        try {
          await update(ref(database), next.updates)
          await outbox.remove(next.id)
          backoffMs = INITIAL_BACKOFF_MS
        } catch (error) {
          console.error(
            `Failed to sync ${JSON.stringify(next.updates)}, will retry`,
            error,
          )
          scheduleRetry()
          return
        }
      }
    } finally {
      draining = false
    }
  }

  function scheduleRetry() {
    if (retryTimer) return
    retryTimer = setTimeout(() => {
      retryTimer = undefined
      backoffMs = Math.min(backoffMs * 2, MAX_BACKOFF_MS)
      void drain()
    }, backoffMs)
  }

  return {
    start() {
      void drain()
      if (typeof window !== "undefined") {
        window.addEventListener("online", () => {
          backoffMs = INITIAL_BACKOFF_MS
          void drain()
        })
      }
    },
    notifyChange() {
      void drain()
    },
  }
}
