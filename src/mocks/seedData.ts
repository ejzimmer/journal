import { LABELS_KEY, StoredLabel, WorkTask, WORK_KEY } from "../tabs/Work/types"
import {
  Category,
  ProjectDetails,
  ProjectSubtask,
  PROJECTS_KEY,
} from "../shared/types"
import {
  BookDetails,
  GameDetails,
  PlayingItemDetails,
  ReadingItemDetails,
  SeriesDetails,
} from "../tabs/Media/types"

const now = Date.now()

function createList(
  id: string,
  description: string,
  position: number,
): WorkTask {
  return {
    id,
    description,
    status: "not_started",
    parentId: WORK_KEY,
    lastStatusUpdate: now,
    position,
  }
}

function createTask(
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

const backlog = createList("list-backlog", "Backlog", 0)
const today = createList("list-today", "Today", 1)
const done = createList("list-done", "Done", 2)

const backlogTask = createTask(
  backlog.id,
  "task-backlog-1",
  "Set up the mock backend",
  0,
)

const demoLabel: StoredLabel = { id: "label-demo", value: "demo", colour: "blue" }
const otherLabel: StoredLabel = { id: "label-other", value: "other", colour: "orange" }

const todayTask = createTask(
  today.id,
  "task-today-1",
  "Try dragging this task",
  0,
  { labelIds: [demoLabel.id] },
)

const doneTask = createTask(done.id, "task-done-1", "See how Done looks", 0, {
  status: "done",
})

const createBook = (
  id: string,
  title: string,
  extra: Partial<BookDetails> = {},
): BookDetails => ({ id, type: "book", title, ...extra })

const createGame = (
  id: string,
  title: string,
  extra: Partial<GameDetails> = {},
): GameDetails => ({ id, type: "game", title, ...extra })

const indexById = <T extends { id: string }>(items: T[]): Record<string, T> =>
  items.reduce(
    (map, item) => {
      map[item.id] = item
      return map
    },
    {} as Record<string, T>,
  )

const createBookSeries = (
  id: string,
  name: string,
  books: BookDetails[],
): SeriesDetails<BookDetails> => ({
  id,
  type: "series",
  name,
  items: indexById(books),
})

const createGameSeries = (
  id: string,
  name: string,
  games: GameDetails[],
): SeriesDetails<GameDetails> => ({
  id,
  type: "series",
  name,
  items: indexById(games),
})

const books = indexById<ReadingItemDetails>([
  createBookSeries("series-discworld", "Discworld", [
    createBook("book-guards", "Guards! Guards!", {
      author: "Terry Pratchett",
      isDone: true,
      medium: "📖",
    }),
    createBook("book-witches", "Witches Abroad", {
      author: "Terry Pratchett",
      isDone: true,
      medium: "🎧",
    }),
    createBook("book-nightwatch", "Night Watch", {
      author: "Terry Pratchett",
      medium: "🎧",
    }),
    createBook("book-thud", "Thud!", { author: "Terry Pratchett" }),
  ]),
  createBook("book-nation", "Nation", {
    author: "Terry Pratchett",
    isDone: true,
    medium: "📖",
  }),
  createBookSeries("series-earthsea", "Earthsea", [
    createBook("book-wizard", "A Wizard of Earthsea", {
      author: "Ursula Le Guin",
      isDone: true,
    }),
    createBook("book-tombs", "The Tombs of Atuan", {
      author: "Ursula Le Guin",
      medium: "📖",
    }),
    createBook("book-shore", "The Farthest Shore", {
      author: "Ursula Le Guin",
    }),
  ]),
  createBook("book-lefthand", "The Left Hand of Darkness", {
    author: "Ursula Le Guin",
    isDone: true,
  }),
  createBook("book-dispossessed", "The Dispossessed", {
    author: "Ursula Le Guin",
  }),
  createBookSeries("series-lockedtomb", "The Locked Tomb", [
    createBook("book-gideon", "Gideon the Ninth", {
      author: "Tamsyn Muir",
      isDone: true,
      medium: "🎧",
    }),
    createBook("book-harrow", "Harrow the Ninth", {
      author: "Tamsyn Muir",
      medium: "🎧",
    }),
    createBook("book-nona", "Nona the Ninth", { author: "Tamsyn Muir" }),
  ]),
  createBook("book-frankenstein", "Frankenstein", { author: "Mary Shelley" }),
  createBook("book-linguist-mages", "The Linguist Mages"),
])

const games = indexById<PlayingItemDetails>([
  createGameSeries("series-zelda", "The Legend of Zelda", [
    createGame("game-botw", "Breath of the Wild", { status: "done" }),
    createGame("game-totk", "Tears of the Kingdom", { status: "in_progress" }),
    createGame("game-echoes", "Echoes of Wisdom"),
  ]),
  createGameSeries("series-portal", "Portal", [
    createGame("game-portal", "Portal", { status: "done" }),
    createGame("game-portal2", "Portal 2", { status: "done" }),
  ]),
  createGame("game-stardew", "Stardew Valley", { status: "in_progress" }),
  createGame("game-hades", "Hades"),
  createGame("game-outer-wilds", "Outer Wilds"),
])

const createSubtask = (
  id: string,
  description: string,
  category: Category,
  position: number,
  status: ProjectSubtask["status"] = "ready",
): ProjectSubtask => ({ id, description, category, position, status })

const createProject = (
  id: string,
  description: string,
  category: Category,
  position: number,
  extra: Partial<ProjectDetails> = {},
): ProjectDetails => ({
  id,
  description,
  category,
  position,
  parentId: PROJECTS_KEY,
  ...extra,
})

const projects = indexById<ProjectDetails>([
  createProject("project-shelves", "Put up the hallway shelves", "🚚", 0, {
    status: "in_progress",
    subtasks: indexById([
      createSubtask("subtask-brackets", "Buy brackets", "🚚", 0, "done"),
      createSubtask("subtask-drill", "Borrow a drill", "🚚", 1),
      createSubtask("subtask-paint", "Paint the boards", "🚚", 2),
    ]),
  }),
  createProject("project-socks", "Knit the striped socks", "🧶", 1, {
    subtasks: indexById([
      createSubtask("subtask-yarn", "Wind the yarn", "🧶", 0),
      createSubtask("subtask-heel", "Learn a better heel", "🧶", 1),
    ]),
  }),
  createProject("project-quilt", "Finish the quilt binding", "🪡", 2),
  createProject("project-groceries", "Plan the week's meals", "🛒", 3),
  createProject("project-journal", "Write up the trip notes", "📓", 4, {
    subtasks: indexById([
      createSubtask("subtask-photos", "Pick the photos", "📓", 0),
    ]),
  }),
  createProject("project-blog", "Redesign the projects tab", "👩‍💻", 5, {
    status: "in_progress",
    subtasks: indexById([
      createSubtask("subtask-spec", "Agree the spec", "👩‍💻", 0, "done"),
      createSubtask("subtask-cards", "Restyle the cards", "👩‍💻", 1),
    ]),
  }),
  createProject("project-desk", "Clear off the desk", "🧹", 6, {
    status: "done",
  }),
  createProject("project-letters", "Reply to the birthday cards", "🖊️", 7),
  createProject("project-boxes", "Unpack the last boxes", "🚚", 8, {
    status: "done",
    subtasks: indexById([
      createSubtask("subtask-books", "Shelve the books", "🚚", 0, "done"),
      createSubtask("subtask-flatten", "Flatten the cartons", "🚚", 1, "done"),
    ]),
  }),
])

export const seedData = {
  [WORK_KEY]: {
    [backlog.id]: { ...backlog, items: { [backlogTask.id]: backlogTask } },
    [today.id]: {
      ...today,
      labelIds: [demoLabel.id],
      items: { [todayTask.id]: todayTask },
    },
    [done.id]: { ...done, items: { [doneTask.id]: doneTask } },
  },
  [LABELS_KEY]: {
    [demoLabel.id]: demoLabel,
    [otherLabel.id]: otherLabel,
  },
  media: {
    books,
    games,
  },
  [PROJECTS_KEY]: projects,
}
