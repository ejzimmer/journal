type PendingFocus = { id: string; reopenMenu: boolean }

let pending: PendingFocus | null = null

// Reordering (and moving between lists) can cause the browser to lose
// focus and desync the popover's anchored position, even when the
// underlying DOM node is preserved. Rather than relying on the DOM to
// carry focus/open-state across a move, we record what should happen to
// the moved item once it re-renders, keyed by its (globally unique) id.
export function requestFocusAfterMove(id: string, reopenMenu: boolean) {
  pending = { id, reopenMenu }
}

export function takePendingFocus(id: string): PendingFocus | null {
  if (pending?.id !== id) {
    return null
  }
  const result = pending
  pending = null
  return result
}
