# Project notes for Claude

## PRs with visible changes

When a change affects anything visible in the UI (layout, colour, sizing, new components, etc.), capture screenshots showing the change, as long as capturing one is feasible (e.g. via the mock Firebase dev server + a headless browser), and show them in chat rather than attaching them to the PR. Prefer before/after or open/closed states where relevant. Skip this only when no visible surface changed, or a screenshot genuinely can't be captured.

Don't commit screenshots into the repo to get them into a PR - GitHub's API doesn't take image attachments directly, and committing PNGs just to work around that leaves them sitting in history for no lasting benefit. Say what you verified in chat, along with the images themselves, where they're free to include without that tradeoff.

## No module-level variables for cross-component state

Don't reach for a `let` at module scope to pass ephemeral state between component instances (e.g. "which item should regain focus after the next render"). It's invisible to React's data flow and got flagged in review. Reach for a hook instead - often a plain `useRef` inside the component already does the job: React preserves a component instance (and its refs/state) across a re-render as long as its `key` doesn't change, even if it moves position within a keyed list, so state that only needs to survive "this instance, across its own re-render" doesn't need to live outside the component at all. Only use React Context (with a Provider mounted above the components that need to share it) for state that genuinely must be shared _across_ different component instances.

## Don't write code comments unless asked

Default to no comments at all. Write code that reads on its own - name things well, keep functions small - and leave the explanation out. A comment that feels necessary is usually a sign the code needs rewriting rather than annotating. This applies to every language and file type here, scripts and config included. The reasoning behind a change belongs in the commit message or the PR description, where it has room and context; the file itself should just be the code. Only add a comment when explicitly asked for one.

## Function names describe what the function does

A function name should describe what the function does. As such, it should include both a verb and a noun - `createItem`, NOT `item`. If a function name uses the verb "resolve" because it does multiple things, it's probably a bad function.

## Node version

The project runs on the Node version in `.nvmrc` (also pinned in `package.json` engines). Containers for Claude Code on the web start on an older Node, where `yarn` refuses to install and the `src/tabs/Health/calories` suites fail with `Temporal is not defined`. `.claude/hooks/session-start.sh` installs and selects the pinned version at session start; if those failures ever show up, check `node -v` before treating them as pre-existing.

## No comments that document abandoned approaches

A code comment should explain the code that's actually there - never an alternative you tried, reasoned about, and discarded before landing on the final version. Comments like "this doesn't need X" or "unlike the previous approach, this avoids Y" reference an implementation history that isn't in the file: nothing on the page shows what X or "the previous approach" was, so a future reader (who never saw your intermediate attempts) has no way to resolve what the comment is contrasting against. It reads as confusing at best, meaningless at worst.

That narrative belongs in the PR description or commit message, where "here's what I tried and why I changed direction" actually has the surrounding context to land in. In the code itself, only document a non-obvious property of the code as it stands - e.g. "this edge is stable regardless of the box's height" is fine; "this doesn't need the max-height reset the earlier version had" is not, because the earlier version is gone and nobody reading this file will ever see it.

Before finishing any change, reread new comments as if you have no memory of the debugging session that produced them - if a comment only makes sense to someone who watched you write and discard code, cut it or rewrite it to describe only what's actually there.

## Test the current behaviour, not the change

A test describes what the code does today, for someone who never saw the version before it. Write it that way: if a change removes close-on-blur, the test worth having is one that pins down what closing the form _does_ require, not one that memorialises what used to happen. A test that only makes sense as a diff against an earlier implementation is the test equivalent of a comment about an abandoned approach.

The tell is an assertion that something _didn't_ happen where nothing gave it any reason to happen. `expect(onSubmit).not.toHaveBeenCalled()` after a validation error is a real test - submission was attempted and the code stopped it. The same assertion when nobody clicked submit tests nothing; it would pass against an empty component. Likewise "expect the form not to submit" is a claim about behaviour, while "expect the input to still be on the screen" after an unrelated click is just restating that React didn't unmount something for no reason.

Before writing a negative assertion, ask what would have to be true for the thing to happen at all. If the answer is "nothing in this test", cut the assertion and test the positive path instead.

## Don't assert absence with queryBy

`expect(screen.queryByRole("textbox")).not.toBeInTheDocument()` usually tests nothing. If the input gains a label, changes role, or the whole block stops rendering for an unrelated reason, the query returns null and the test still passes - including in exactly the broken state it was meant to catch.

When the point is that an element _disappears_, grab it with `getBy` while it's still there, hold the reference, and assert on that reference afterwards:

```js
const input = screen.getByRole('textbox', { name: 'Description' });
await user.keyboard('{Escape}');
expect(input).not.toBeInTheDocument();
```

That version fails if the element is still mounted, and it also fails at the `getBy` if the starting state was never right. Reach for `queryBy` only when the element genuinely never existed in the test - and then consider whether the assertion is earning its place at all.

## Group tests in describe blocks

Don't write a test file as a flat list of `it`s. Group them in `describe` blocks - by the thing under test, and then by the condition it's under - and work out the groupings yourself rather than waiting to be given them. Nested describes are good: `describe("paused tasks") > describe("when one is due today") > it("wakes it up")`.

The point is that the name of a test should read as a sentence with the describes above it, so a failure tells you the situation as well as the broken expectation. It also stops the same setup being restated in every test name, keeps related cases next to each other, and makes a missing case obvious - an empty branch of the tree is easier to spot than an absence in a list.

This applies to a file with three tests in it, not just to big ones.

## Don't resolve review comments

Reply to review comments, push the fix, and leave the thread open. Resolving is the reviewer's call - it's how they track what they've checked, and closing a thread on their behalf hides it from them before they've seen the change. This holds even when the comment is unambiguous and the fix is obviously what was asked for.

## Don't write PR descriptions

Open the PR with a title and an empty body. A description only ever restates what's already been said in chat or what the diff and the commit messages say themselves, and those are easier to trust because they can't drift from the code the way a summary written beside it does. Put the reasoning for a change in its commit message, where it belongs.

Don't report back on the description either - not writing one, updating one, or what went in it.
