# Media tab redesign

Two documents, both standalone HTML — open them straight from disk in a browser.

- **`spec.html`** — what to build. The outcome, the decisions that are already
  settled (don't reopen them), and the traps that cost time when you meet them
  cold. Read this first.
- **`prototype.html`** — the working reference. Fully interactive: click a book
  to open its dialog, click the stamp at its foot to cycle status, rename
  anything by clicking it, add a book, give one the author or series it's
  missing. It runs against an in-memory copy of the data, so nothing it does
  touches Firebase.

Where the spec is silent, the prototype's behaviour is what's wanted. It is a
single file of plain DOM code with no build step and no relationship to the
app's components — it shows the result, not the implementation.
