import { createContext, ReactNode, useContext, useState } from "react"

type OpenProjectContextValue = {
  openProjectId: string | null
  setOpenProjectId: (id: string | null) => void
}

const OpenProjectContext = createContext<OpenProjectContextValue | undefined>(
  undefined,
)

const STORAGE_KEY = "openProjectId"

function getStoredOpenProjectId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function storeOpenProjectId(id: string | null) {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEY, id)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Ignore storage errors, e.g. private browsing or a full quota
  }
}

export function OpenProjectProvider({ children }: { children: ReactNode }) {
  const [openProjectId, setOpenProjectIdState] = useState(
    getStoredOpenProjectId,
  )

  const setOpenProjectId = (id: string | null) => {
    setOpenProjectIdState(id)
    storeOpenProjectId(id)
  }

  return (
    <OpenProjectContext.Provider value={{ openProjectId, setOpenProjectId }}>
      {children}
    </OpenProjectContext.Provider>
  )
}

export function useOpenProject() {
  const context = useContext(OpenProjectContext)
  if (!context) {
    throw new Error(
      "useOpenProject must be used within an OpenProjectProvider",
    )
  }
  return context
}
