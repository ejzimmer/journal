import { LABELS_KEY, StoredLabel, WorkTask, WORK_KEY } from "../tabs/Work/types"
import {
  AuthorDetails,
  BookDetails,
  GameDetails,
  PlayingItemDetails,
  ReadingItemDetails,
  SeriesDetails,
} from "../tabs/Media/types"

const now = Date.now()

function list(id: string, description: string, position: number): WorkTask {
  return {
    id,
    description,
    status: "not_started",
    parentId: WORK_KEY,
    lastStatusUpdate: now,
    position,
  }
}

function task(
  listId: string,
  id: string,
  description: string,
  position: number,
  extra: Partial<WorkTask> = {},
): WorkTask {
  return {
    id,
    description,
    status: "not_started",
    parentId: `${WORK_KEY}/${listId}/items`,
    lastStatusUpdate: now,
    position,
    ...extra,
  }
}

const backlog = list("list-backlog", "Backlog", 0)
const today = list("list-today", "Today", 1)
const done = list("list-done", "Done", 2)

const backlogTask = task(
  backlog.id,
  "task-backlog-1",
  "Set up the mock backend",
  0,
)

const demoLabel: StoredLabel = { id: "label-demo", value: "demo", colour: "blue" }

const todayTask = task(today.id, "task-today-1", "Try dragging this task", 0, {
  labelIds: [demoLabel.id],
})

const doneTask = task(done.id, "task-done-1", "See how Done looks", 0, {
  status: "done",
})

const book = (
  id: string,
  title: string,
  extra: Partial<BookDetails> = {},
): BookDetails => ({ id, type: "book", title, ...extra })

const game = (
  id: string,
  title: string,
  extra: Partial<GameDetails> = {},
): GameDetails => ({ id, type: "game", title, ...extra })

const byId = <T extends { id: string }>(items: T[]): Record<string, T> =>
  items.reduce(
    (map, item) => {
      map[item.id] = item
      return map
    },
    {} as Record<string, T>,
  )

const bookSeries = (
  id: string,
  name: string,
  books: BookDetails[],
): SeriesDetails<BookDetails> => ({
  id,
  type: "series",
  name,
  items: byId(books),
})

const author = (
  id: string,
  name: string,
  items: (SeriesDetails<BookDetails> | BookDetails)[],
): AuthorDetails => ({ id, type: "author", name, items: byId(items) })

const gameSeries = (
  id: string,
  name: string,
  games: GameDetails[],
): SeriesDetails<GameDetails> => ({
  id,
  type: "series",
  name,
  items: byId(games),
})

const books = byId<ReadingItemDetails>([
  author("author-pratchett", "Terry Pratchett", [
    bookSeries("series-discworld", "Discworld", [
      book("book-guards", "Guards! Guards!", { isDone: true, medium: "📖" }),
      book("book-witches", "Witches Abroad", { isDone: true, medium: "🎧" }),
      book("book-nightwatch", "Night Watch", { medium: "🎧" }),
      book("book-thud", "Thud!"),
    ]),
    book("book-nation", "Nation", { isDone: true, medium: "📖" }),
  ]),
  author("author-leguin", "Ursula Le Guin", [
    bookSeries("series-earthsea", "Earthsea", [
      book("book-wizard", "A Wizard of Earthsea", { isDone: true }),
      book("book-tombs", "The Tombs of Atuan", { medium: "📖" }),
      book("book-shore", "The Farthest Shore"),
    ]),
    book("book-lefthand", "The Left Hand of Darkness", { isDone: true }),
    book("book-dispossessed", "The Dispossessed"),
  ]),
  author("author-muir", "Tamsyn Muir", [
    bookSeries("series-lockedtomb", "The Locked Tomb", [
      book("book-gideon", "Gideon the Ninth", { isDone: true, medium: "🎧" }),
      book("book-harrow", "Harrow the Ninth", { medium: "🎧" }),
      book("book-nona", "Nona the Ninth"),
    ]),
  ]),
  author("author-shelley", "Mary Shelley", [
    book("book-frankenstein", "Frankenstein"),
  ]),
  book("book-linguist-mages", "The Linguist Mages"),
])

const games = byId<PlayingItemDetails>([
  gameSeries("series-zelda", "The Legend of Zelda", [
    game("game-botw", "Breath of the Wild", { status: "done" }),
    game("game-totk", "Tears of the Kingdom", { status: "in_progress" }),
    game("game-echoes", "Echoes of Wisdom"),
  ]),
  gameSeries("series-portal", "Portal", [
    game("game-portal", "Portal", { status: "done" }),
    game("game-portal2", "Portal 2", { status: "done" }),
  ]),
  game("game-stardew", "Stardew Valley", { status: "in_progress" }),
  game("game-hades", "Hades"),
  game("game-outer-wilds", "Outer Wilds"),
])

export const seedData = {
  [WORK_KEY]: {
    [backlog.id]: { ...backlog, items: { [backlogTask.id]: backlogTask } },
    [today.id]: { ...today, items: { [todayTask.id]: todayTask } },
    [done.id]: { ...done, items: { [doneTask.id]: doneTask } },
  },
  [LABELS_KEY]: {
    [demoLabel.id]: demoLabel,
  },
  media: {
    books,
    games,
  },
}
