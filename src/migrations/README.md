# Migrations

Temporary code that reshapes stored data when the app loads. Each migration
lives in its own file here and is called from `AppRoutes`. A migration reads
what it needs, rewrites it, and leaves nothing for itself to do on the next
load - so once it has run against the live database, delete the file, its
tests, and the call in `AppRoutes`.

## flattenBookAuthors

Books used to be stored under an author node - `media/books/<author>` and
`media/books/<author>/<series>`. They now sit alongside games' structure:
books and series at the top level, with the author's name as a field on each
book.
