import { useEffect, useSyncExternalStore } from "react"
import { getWaitingRegistration, subscribe } from "./appUpdateStore"
import "./AppUpdateBanner.css"

export function AppUpdateBanner() {
  const waitingRegistration = useSyncExternalStore(
    subscribe,
    getWaitingRegistration,
  )

  useEffect(() => {
    if (!waitingRegistration) return

    const reload = () => window.location.reload()
    navigator.serviceWorker.addEventListener("controllerchange", reload)
    return () =>
      navigator.serviceWorker.removeEventListener("controllerchange", reload)
  }, [waitingRegistration])

  if (!waitingRegistration) return null

  return (
    <div className="app-update-banner">
      <span>A new version is available.</span>
      <button
        className="primary"
        onClick={() =>
          waitingRegistration.waiting?.postMessage({ type: "SKIP_WAITING" })
        }
      >
        Refresh
      </button>
    </div>
  )
}
