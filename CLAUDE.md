# Project notes for Claude

## PRs with visible changes

When a change affects anything visible in the UI (layout, colour, sizing, new components, etc.), capture screenshots showing the change, as long as capturing one is feasible (e.g. via the mock Firebase dev server + a headless browser), and show them in chat rather than attaching them to the PR. Prefer before/after or open/closed states where relevant. Skip this only when no visible surface changed, or a screenshot genuinely can't be captured.

Don't commit screenshots into the repo to get them into a PR description - GitHub's API doesn't take image attachments directly, and committing PNGs just to work around that leaves them sitting in history for no lasting benefit. The PR description can describe what was verified in words; the actual images belong in chat, where they're free to include without that tradeoff.

## No module-level variables for cross-component state

Don't reach for a `let` at module scope to pass ephemeral state between component instances (e.g. "which item should regain focus after the next render"). It's invisible to React's data flow and got flagged in review. Reach for a hook instead - often a plain `useRef` inside the component already does the job: React preserves a component instance (and its refs/state) across a re-render as long as its `key` doesn't change, even if it moves position within a keyed list, so state that only needs to survive "this instance, across its own re-render" doesn't need to live outside the component at all. Only use React Context (with a Provider mounted above the components that need to share it) for state that genuinely must be shared *across* different component instances.

## Don't write code comments unless asked

Default to no comments at all. Write code that reads on its own - name things well, keep functions small - and leave the explanation out. A comment that feels necessary is usually a sign the code needs rewriting rather than annotating. This applies to every language and file type here, scripts and config included. The reasoning behind a change belongs in the commit message or the PR description, where it has room and context; the file itself should just be the code. Only add a comment when explicitly asked for one.

## Node version

The project runs on the Node version in `.nvmrc` (also pinned in `package.json` engines). Containers for Claude Code on the web start on an older Node, where `yarn` refuses to install and the `src/tabs/Health/calories` suites fail with `Temporal is not defined`. `.claude/hooks/session-start.sh` installs and selects the pinned version at session start; if those failures ever show up, check `node -v` before treating them as pre-existing.

## No comments that document abandoned approaches

A code comment should explain the code that's actually there - never an alternative you tried, reasoned about, and discarded before landing on the final version. Comments like "this doesn't need X" or "unlike the previous approach, this avoids Y" reference an implementation history that isn't in the file: nothing on the page shows what X or "the previous approach" was, so a future reader (who never saw your intermediate attempts) has no way to resolve what the comment is contrasting against. It reads as confusing at best, meaningless at worst.

That narrative belongs in the PR description or commit message, where "here's what I tried and why I changed direction" actually has the surrounding context to land in. In the code itself, only document a non-obvious property of the code as it stands - e.g. "this edge is stable regardless of the box's height" is fine; "this doesn't need the max-height reset the earlier version had" is not, because the earlier version is gone and nobody reading this file will ever see it.

Before finishing any change, reread new comments as if you have no memory of the debugging session that produced them - if a comment only makes sense to someone who watched you write and discard code, cut it or rewrite it to describe only what's actually there.

## Function names have to mean something

A function's name is the only part of it most readers will ever see. It should say what the function does, or what it hands back, specifically enough that someone who never opens the body can predict both.

`apply` almost never does that. Apply what, to what? It fills the verb slot without committing to anything, and `handle`, `process`, `manage` and `do` are the same. If a name only makes sense once you've read the argument list or the body, it isn't naming the function - it's just occupying the space where the name goes.

Start it with the verb for what it does - `getEmptiedParent`, `removeFromList`, `convertFromBookStatus`. A bare noun phrase reads as a value rather than a call, so `parentsOf`, `childrenOf`, `seriesIn` and `pathTo` all want a `get` on the front. Watch which verb: `resolveParentPath` sounds like it works a path out and hands it back, so the author or series it quietly creates on the way is a surprise. And a preposition has to be carrying its weight - `addToList` and `removeFromList` name a direction relative to the list, but `updateInList` just updates one item, so it's `updateItem`. If no specific verb fits, that's usually the function doing more than one thing, and the fix is to split it rather than to reach for a vaguer word.

## No single-line helpers in tests

A helper in a test file has to earn its name. `typeTitle(user, "Thud!")` and `create(user)` each wrapped one line and saved nothing: a reader now has to scroll up to learn that "create" clicks a button labelled Create, and `create(user)` reads like it creates a user, which it doesn't. The line each replaced already said exactly what it did, in the place where it mattered.

Write the interaction out in the test. A helper earns its place when it sets up something several tests share and would otherwise repeat - a render with a stocked context, a fixture, a fake - not when it renames a single call.
