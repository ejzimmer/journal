# Project notes for Claude

## PRs with visible changes

When a change affects anything visible in the UI (layout, colour, sizing, new components, etc.), include screenshots in the PR description showing the change, as long as capturing one is feasible (e.g. via the mock Firebase dev server + a headless browser). Prefer before/after or open/closed states where relevant. Skip this only when no visible surface changed, or a screenshot genuinely can't be captured.

## No module-level variables for cross-component state

Don't reach for a `let` at module scope to pass ephemeral state between component instances (e.g. "which item should regain focus after the next render"). It's invisible to React's data flow and got flagged in review. Reach for a hook instead - often a plain `useRef` inside the component already does the job: React preserves a component instance (and its refs/state) across a re-render as long as its `key` doesn't change, even if it moves position within a keyed list, so state that only needs to survive "this instance, across its own re-render" doesn't need to live outside the component at all. Only use React Context (with a Provider mounted above the components that need to share it) for state that genuinely must be shared *across* different component instances.

## No comments that document abandoned approaches

A code comment should explain the code that's actually there - never an alternative you tried, reasoned about, and discarded before landing on the final version. Comments like "this doesn't need X" or "unlike the previous approach, this avoids Y" reference an implementation history that isn't in the file: nothing on the page shows what X or "the previous approach" was, so a future reader (who never saw your intermediate attempts) has no way to resolve what the comment is contrasting against. It reads as confusing at best, meaningless at worst.

That narrative belongs in the PR description or commit message, where "here's what I tried and why I changed direction" actually has the surrounding context to land in. In the code itself, only document a non-obvious property of the code as it stands - e.g. "this edge is stable regardless of the box's height" is fine; "this doesn't need the max-height reset the earlier version had" is not, because the earlier version is gone and nobody reading this file will ever see it.

Before finishing any change, reread new comments as if you have no memory of the debugging session that produced them - if a comment only makes sense to someone who watched you write and discard code, cut it or rewrite it to describe only what's actually there.
