import "./App.css"
import { AppShell } from "./AppShell"

/**
 * Root component used only when running against the mock Firebase backend
 * (see shared/mockFirebase.ts) — skips the Google sign-in gate entirely,
 * since there's no real Firebase project to authenticate against.
 */
export function MockApp() {
  return <AppShell />
}
