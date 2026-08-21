# Project notes for Claude

## PRs with visible changes

When a change affects anything visible in the UI (layout, colour, sizing, new components, etc.), include screenshots in the PR description showing the change, as long as capturing one is feasible (e.g. via the mock Firebase dev server + a headless browser). Prefer before/after or open/closed states where relevant. Skip this only when no visible surface changed, or a screenshot genuinely can't be captured.

## No module-level variables for cross-component state

Don't reach for a `let` at module scope to pass ephemeral state between component instances (e.g. "which item should regain focus after the next render"). It's invisible to React's data flow and got flagged in review. Reach for a hook instead - often a plain `useRef` inside the component already does the job: React preserves a component instance (and its refs/state) across a re-render as long as its `key` doesn't change, even if it moves position within a keyed list, so state that only needs to survive "this instance, across its own re-render" doesn't need to live outside the component at all. Only use React Context (with a Provider mounted above the components that need to share it) for state that genuinely must be shared *across* different component instances.
