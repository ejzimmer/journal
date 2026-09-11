import { act, useContext } from "react"
import { render } from "@testing-library/react"
import { ContextType } from "../../shared/FirebaseContext"
import { renderWithStorage } from "../../shared/storageContextTestUtils"
import { createMockFirebaseContext } from "../../shared/mockFirebase"
import {
  MediaStorageContext,
  MediaStorageContextType,
  MediaStorageProvider,
  useMediaStorage,
} from "./MediaStorageContext"
import {
  BookDetails,
  BOOKS_KEY,
  GameDetails,
  GAMES_KEY,
  PlayingItemDetails,
  ReadingItemDetails,
  SeriesDetails,
} from "./types"

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

const createSeries = <T extends BookDetails | GameDetails>(
  id: string,
  name: string,
  items: T[],
): SeriesDetails<T> => ({
  id,
  type: "series",
  name,
  items: Object.fromEntries(items.map((item) => [item.id, item])),
})

const guards = createBook("book-guards", "Guards! Guards!", {
  author: "Terry Pratchett",
})
const nightWatch = createBook("book-nightwatch", "Night Watch", {
  author: "Terry Pratchett",
})
const discworld = createSeries("series-discworld", "Discworld", [
  guards,
  nightWatch,
])
const earthsea = createSeries("series-earthsea", "Earthsea", [
  createBook("book-wizard", "A Wizard of Earthsea", {
    author: "Ursula Le Guin",
  }),
])
const nation = createBook("book-nation", "Nation", { author: "Terry Pratchett" })

const botw = createGame("game-botw", "Breath of the Wild")
const totk = createGame("game-totk", "Tears of the Kingdom")
const zelda = createSeries("series-zelda", "The Legend of Zelda", [botw, totk])
const portal = createSeries("series-portal", "Portal", [
  createGame("game-portal", "Portal"),
])
const stardew = createGame("game-stardew", "Stardew Valley")

const indexById = <T extends { id: string }>(items: T[]) =>
  Object.fromEntries(items.map((item) => [item.id, item]))

const storedBooks = indexById<ReadingItemDetails>([discworld, nation, earthsea])
const storedGames = indexById<PlayingItemDetails>([zelda, stardew, portal])

function createFirebaseContext(
  {
    books,
    games,
  }: {
    books?: Record<string, ReadingItemDetails>
    games?: Record<string, PlayingItemDetails>
  } = { books: storedBooks, games: storedGames },
) {
  return {
    addItem: jest.fn(() => "new-id"),
    updateItem: jest.fn(),
    deleteItem: jest.fn(),
    updateList: jest.fn(),
    moveItemBetweenLists: jest.fn(),
    setValue: jest.fn(),
    useValue: <T,>(key?: string) => {
      const value = key === GAMES_KEY ? games : books
      return { value: value as unknown as T | undefined, loading: false }
    },
  }
}

function HookProbe() {
  useMediaStorage()
  return null
}

function Probe({
  onRender,
}: {
  onRender: (context: MediaStorageContextType | undefined) => void
}) {
  const context = useContext(MediaStorageContext)
  onRender(context)
  return null
}

function getMediaStorage(firebaseContext: Partial<ContextType>) {
  const captured: { current?: MediaStorageContextType } = {}
  renderWithStorage(
    <MediaStorageProvider>
      <Probe onRender={(context) => (captured.current = context)} />
    </MediaStorageProvider>,
    { value: firebaseContext },
  )
  return captured
}

describe("MediaStorageContext", () => {
  it("throws when the hook is used outside a provider", () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation()

    expect(() => render(<HookProbe />)).toThrow(
      "missing MediaStorageContext provider",
    )

    errorSpy.mockRestore()
  })

  describe("reading the lists", () => {
    it("returns the books and the games", () => {
      const mediaStorage = getMediaStorage(createFirebaseContext())

      expect(mediaStorage.current?.books).toEqual([discworld, nation, earthsea])
      expect(mediaStorage.current?.games).toEqual([zelda, stardew, portal])
    })

    it("returns empty lists when nothing is stored", () => {
      const mediaStorage = getMediaStorage(createFirebaseContext({}))

      expect(mediaStorage.current?.books).toEqual([])
      expect(mediaStorage.current?.games).toEqual([])
    })

    it("reports the loading state from the firebase context", () => {
      const mediaStorage = getMediaStorage({
        ...createFirebaseContext(),
        useValue: () => ({ value: undefined, loading: true }),
      })

      expect(mediaStorage.current?.isLoading).toBe(true)
    })

    it("returns the book series and the game series", () => {
      const mediaStorage = getMediaStorage(createFirebaseContext())

      expect(mediaStorage.current?.bookSeries).toEqual([discworld, earthsea])
      expect(mediaStorage.current?.gameSeries).toEqual([zelda, portal])
    })

    it("returns the authors of every book, including books in a series", () => {
      const mediaStorage = getMediaStorage(createFirebaseContext())

      expect(mediaStorage.current?.authors).toEqual([
        "Terry Pratchett",
        "Ursula Le Guin",
      ])
    })

    it("leaves books without an author out of the authors list", () => {
      const mediaStorage = getMediaStorage(
        createFirebaseContext({
          books: indexById<ReadingItemDetails>([
            createBook("book-untitled", "Anonymous"),
            nation,
          ]),
        }),
      )

      expect(mediaStorage.current?.authors).toEqual(["Terry Pratchett"])
    })
  })

  describe("adding to the main list", () => {
    it("addBook writes a book to the books key", () => {
      const firebaseContext = createFirebaseContext()
      const mediaStorage = getMediaStorage(firebaseContext)

      mediaStorage.current?.addBook({ title: "Thud!", author: "Terry Pratchett" })

      expect(firebaseContext.addItem).toHaveBeenCalledWith(BOOKS_KEY, {
        type: "book",
        title: "Thud!",
        author: "Terry Pratchett",
      })
    })

    it("addGame writes a game to the games key", () => {
      const firebaseContext = createFirebaseContext()
      const mediaStorage = getMediaStorage(firebaseContext)

      mediaStorage.current?.addGame({ title: "Hades" })

      expect(firebaseContext.addItem).toHaveBeenCalledWith(GAMES_KEY, {
        type: "game",
        title: "Hades",
      })
    })
  })

  describe("adding a series", () => {
    it("addBookSeries creates the series and puts the book in it", () => {
      const firebaseContext = createFirebaseContext()
      const mediaStorage = getMediaStorage(firebaseContext)

      mediaStorage.current?.addBookSeries("Tiffany Aching", {
        title: "The Wee Free Men",
        author: "Terry Pratchett",
      })

      expect(firebaseContext.addItem).toHaveBeenNthCalledWith(1, BOOKS_KEY, {
        type: "series",
        name: "Tiffany Aching",
      })
      expect(firebaseContext.addItem).toHaveBeenNthCalledWith(
        2,
        `${BOOKS_KEY}/new-id/items`,
        {
          type: "book",
          title: "The Wee Free Men",
          author: "Terry Pratchett",
        },
      )
    })

    it("addGameSeries creates the series and puts the game in it", () => {
      const firebaseContext = createFirebaseContext()
      const mediaStorage = getMediaStorage(firebaseContext)

      mediaStorage.current?.addGameSeries("Metroid", { title: "Dread" })

      expect(firebaseContext.addItem).toHaveBeenNthCalledWith(1, GAMES_KEY, {
        type: "series",
        name: "Metroid",
      })
      expect(firebaseContext.addItem).toHaveBeenNthCalledWith(
        2,
        `${GAMES_KEY}/new-id/items`,
        { type: "game", title: "Dread" },
      )
    })
  })

  describe("adding to an existing series", () => {
    it("addBookToSeries writes the book under the series items", () => {
      const firebaseContext = createFirebaseContext()
      const mediaStorage = getMediaStorage(firebaseContext)

      mediaStorage.current?.addBookToSeries(discworld.id, {
        title: "Thud!",
        author: "Terry Pratchett",
      })

      expect(firebaseContext.addItem).toHaveBeenCalledWith(
        `${BOOKS_KEY}/series-discworld/items`,
        { type: "book", title: "Thud!", author: "Terry Pratchett" },
      )
    })

    it("addGameToSeries writes the game under the series items", () => {
      const firebaseContext = createFirebaseContext()
      const mediaStorage = getMediaStorage(firebaseContext)

      mediaStorage.current?.addGameToSeries(zelda.id, {
        title: "Echoes of Wisdom",
      })

      expect(firebaseContext.addItem).toHaveBeenCalledWith(
        `${GAMES_KEY}/series-zelda/items`,
        { type: "game", title: "Echoes of Wisdom" },
      )
    })
  })

  describe("deleting", () => {
    it("deleteBook removes a standalone book from the books key", () => {
      const firebaseContext = createFirebaseContext()
      const mediaStorage = getMediaStorage(firebaseContext)

      mediaStorage.current?.deleteBook(nation)

      expect(firebaseContext.deleteItem).toHaveBeenCalledWith(BOOKS_KEY, nation)
    })

    it("deleteBook removes a book from its series", () => {
      const firebaseContext = createFirebaseContext()
      const mediaStorage = getMediaStorage(firebaseContext)

      mediaStorage.current?.deleteBook(guards)

      expect(firebaseContext.deleteItem).toHaveBeenCalledWith(
        `${BOOKS_KEY}/series-discworld/items`,
        guards,
      )
    })

    it("deleteBook deletes the series when the book was the last one in it", () => {
      const firebaseContext = createFirebaseContext()
      const mediaStorage = getMediaStorage(firebaseContext)
      const [onlyBook] = Object.values(earthsea.items ?? {})

      mediaStorage.current?.deleteBook(onlyBook)

      expect(firebaseContext.deleteItem).toHaveBeenCalledTimes(1)
      expect(firebaseContext.deleteItem).toHaveBeenCalledWith(
        BOOKS_KEY,
        earthsea,
      )
    })

    it("deleteGame removes a standalone game from the games key", () => {
      const firebaseContext = createFirebaseContext()
      const mediaStorage = getMediaStorage(firebaseContext)

      mediaStorage.current?.deleteGame(stardew)

      expect(firebaseContext.deleteItem).toHaveBeenCalledWith(
        GAMES_KEY,
        stardew,
      )
    })

    it("deleteGame removes a game from its series", () => {
      const firebaseContext = createFirebaseContext()
      const mediaStorage = getMediaStorage(firebaseContext)

      mediaStorage.current?.deleteGame(botw)

      expect(firebaseContext.deleteItem).toHaveBeenCalledWith(
        `${GAMES_KEY}/series-zelda/items`,
        botw,
      )
    })

    it("deleteGame deletes the series when the game was the last one in it", () => {
      const firebaseContext = createFirebaseContext()
      const mediaStorage = getMediaStorage(firebaseContext)
      const [onlyGame] = Object.values(portal.items ?? {})

      mediaStorage.current?.deleteGame(onlyGame)

      expect(firebaseContext.deleteItem).toHaveBeenCalledTimes(1)
      expect(firebaseContext.deleteItem).toHaveBeenCalledWith(GAMES_KEY, portal)
    })
  })

  describe("moving to another series", () => {
    it("moveBookToSeries writes the book to the new series and removes it from the old one", () => {
      const firebaseContext = createFirebaseContext()
      const mediaStorage = getMediaStorage(firebaseContext)

      mediaStorage.current?.moveBookToSeries(guards, earthsea.id)

      expect(firebaseContext.updateItem).toHaveBeenCalledWith(
        `${BOOKS_KEY}/series-earthsea/items`,
        guards,
      )
      expect(firebaseContext.deleteItem).toHaveBeenCalledWith(
        `${BOOKS_KEY}/series-discworld/items`,
        guards,
      )
    })

    it("moveBookToSeries deletes the old series when the book was the last one in it", () => {
      const firebaseContext = createFirebaseContext()
      const mediaStorage = getMediaStorage(firebaseContext)
      const [onlyBook] = Object.values(earthsea.items ?? {})

      mediaStorage.current?.moveBookToSeries(onlyBook, discworld.id)

      expect(firebaseContext.updateItem).toHaveBeenCalledWith(
        `${BOOKS_KEY}/series-discworld/items`,
        onlyBook,
      )
      expect(firebaseContext.deleteItem).toHaveBeenCalledTimes(1)
      expect(firebaseContext.deleteItem).toHaveBeenCalledWith(
        BOOKS_KEY,
        earthsea,
      )
    })

    it("moveBookToSeries moves a standalone book into the series", () => {
      const firebaseContext = createFirebaseContext()
      const mediaStorage = getMediaStorage(firebaseContext)

      mediaStorage.current?.moveBookToSeries(nation, discworld.id)

      expect(firebaseContext.updateItem).toHaveBeenCalledWith(
        `${BOOKS_KEY}/series-discworld/items`,
        nation,
      )
      expect(firebaseContext.deleteItem).toHaveBeenCalledWith(BOOKS_KEY, nation)
    })

    it("moveBookToSeries does nothing when the book is already in that series", () => {
      const firebaseContext = createFirebaseContext()
      const mediaStorage = getMediaStorage(firebaseContext)

      mediaStorage.current?.moveBookToSeries(guards, discworld.id)

      expect(firebaseContext.updateItem).not.toHaveBeenCalled()
      expect(firebaseContext.deleteItem).not.toHaveBeenCalled()
    })

    it("moveGameToSeries writes the game to the new series and removes it from the old one", () => {
      const firebaseContext = createFirebaseContext()
      const mediaStorage = getMediaStorage(firebaseContext)

      mediaStorage.current?.moveGameToSeries(botw, portal.id)

      expect(firebaseContext.updateItem).toHaveBeenCalledWith(
        `${GAMES_KEY}/series-portal/items`,
        botw,
      )
      expect(firebaseContext.deleteItem).toHaveBeenCalledWith(
        `${GAMES_KEY}/series-zelda/items`,
        botw,
      )
    })

    it("moveGameToSeries deletes the old series when the game was the last one in it", () => {
      const firebaseContext = createFirebaseContext()
      const mediaStorage = getMediaStorage(firebaseContext)
      const [onlyGame] = Object.values(portal.items ?? {})

      mediaStorage.current?.moveGameToSeries(onlyGame, zelda.id)

      expect(firebaseContext.updateItem).toHaveBeenCalledWith(
        `${GAMES_KEY}/series-zelda/items`,
        onlyGame,
      )
      expect(firebaseContext.deleteItem).toHaveBeenCalledTimes(1)
      expect(firebaseContext.deleteItem).toHaveBeenCalledWith(GAMES_KEY, portal)
    })
  })

  describe("moving back to the main list", () => {
    it("moveBookToMainList writes the book to the books key and removes it from its series", () => {
      const firebaseContext = createFirebaseContext()
      const mediaStorage = getMediaStorage(firebaseContext)

      mediaStorage.current?.moveBookToMainList(guards)

      expect(firebaseContext.updateItem).toHaveBeenCalledWith(BOOKS_KEY, guards)
      expect(firebaseContext.deleteItem).toHaveBeenCalledWith(
        `${BOOKS_KEY}/series-discworld/items`,
        guards,
      )
    })

    it("moveBookToMainList deletes the series when the book was the last one in it", () => {
      const firebaseContext = createFirebaseContext()
      const mediaStorage = getMediaStorage(firebaseContext)
      const [onlyBook] = Object.values(earthsea.items ?? {})

      mediaStorage.current?.moveBookToMainList(onlyBook)

      expect(firebaseContext.updateItem).toHaveBeenCalledWith(
        BOOKS_KEY,
        onlyBook,
      )
      expect(firebaseContext.deleteItem).toHaveBeenCalledTimes(1)
      expect(firebaseContext.deleteItem).toHaveBeenCalledWith(
        BOOKS_KEY,
        earthsea,
      )
    })

    it("moveBookToMainList does nothing when the book is already in the main list", () => {
      const firebaseContext = createFirebaseContext()
      const mediaStorage = getMediaStorage(firebaseContext)

      mediaStorage.current?.moveBookToMainList(nation)

      expect(firebaseContext.updateItem).not.toHaveBeenCalled()
      expect(firebaseContext.deleteItem).not.toHaveBeenCalled()
    })

    it("moveGameToMainList writes the game to the games key and removes it from its series", () => {
      const firebaseContext = createFirebaseContext()
      const mediaStorage = getMediaStorage(firebaseContext)

      mediaStorage.current?.moveGameToMainList(botw)

      expect(firebaseContext.updateItem).toHaveBeenCalledWith(GAMES_KEY, botw)
      expect(firebaseContext.deleteItem).toHaveBeenCalledWith(
        `${GAMES_KEY}/series-zelda/items`,
        botw,
      )
    })

    it("moveGameToMainList deletes the series when the game was the last one in it", () => {
      const firebaseContext = createFirebaseContext()
      const mediaStorage = getMediaStorage(firebaseContext)
      const [onlyGame] = Object.values(portal.items ?? {})

      mediaStorage.current?.moveGameToMainList(onlyGame)

      expect(firebaseContext.updateItem).toHaveBeenCalledWith(
        GAMES_KEY,
        onlyGame,
      )
      expect(firebaseContext.deleteItem).toHaveBeenCalledTimes(1)
      expect(firebaseContext.deleteItem).toHaveBeenCalledWith(GAMES_KEY, portal)
    })

    it("moveGameToMainList does nothing when the game is already in the main list", () => {
      const firebaseContext = createFirebaseContext()
      const mediaStorage = getMediaStorage(firebaseContext)

      mediaStorage.current?.moveGameToMainList(stardew)

      expect(firebaseContext.updateItem).not.toHaveBeenCalled()
      expect(firebaseContext.deleteItem).not.toHaveBeenCalled()
    })
  })

  describe("against the mock backend", () => {
    const renderWithMockBackend = () => {
      const firebaseContext = createMockFirebaseContext({
        media: { books: storedBooks, games: storedGames },
      })
      const mediaStorage = getMediaStorage(firebaseContext)
      return mediaStorage
    }

    it("adding a series leaves the series holding the new book", () => {
      const mediaStorage = renderWithMockBackend()

      act(() => {
        mediaStorage.current?.addBookSeries("Tiffany Aching", {
          title: "The Wee Free Men",
        })
      })

      const series = mediaStorage.current?.bookSeries.find(
        (series) => series.name === "Tiffany Aching",
      )
      expect(Object.values(series?.items ?? {})).toEqual([
        expect.objectContaining({ type: "book", title: "The Wee Free Men" }),
      ])
    })

    it("deleting the last book in a series removes the series from the list", () => {
      const mediaStorage = renderWithMockBackend()
      const [onlyBook] = Object.values(earthsea.items ?? {})

      act(() => {
        mediaStorage.current?.deleteBook(onlyBook)
      })

      expect(mediaStorage.current?.books).toEqual([discworld, nation])
    })

    it("moving a book keeps it in the new series only", () => {
      const mediaStorage = renderWithMockBackend()

      act(() => {
        mediaStorage.current?.moveBookToSeries(guards, earthsea.id)
      })

      const bookSeries = mediaStorage.current?.bookSeries ?? []
      const discworldItems = bookSeries.find(
        (series) => series.id === discworld.id,
      )?.items
      const earthseaItems = bookSeries.find(
        (series) => series.id === earthsea.id,
      )?.items

      expect(Object.keys(discworldItems ?? {})).toEqual([nightWatch.id])
      expect(Object.keys(earthseaItems ?? {}).sort()).toEqual(
        [guards.id, "book-wizard"].sort(),
      )
    })

    it("moving a book to the main list leaves it alongside the series", () => {
      const mediaStorage = renderWithMockBackend()

      act(() => {
        mediaStorage.current?.moveBookToMainList(guards)
      })

      const books = mediaStorage.current?.books ?? []
      expect(books).toContainEqual(guards)
      const discworldItems = books.find(
        (book) => book.id === discworld.id,
      ) as typeof discworld
      expect(Object.keys(discworldItems.items ?? {})).toEqual([nightWatch.id])
    })

    it("moving the last book in a series to the main list removes the series", () => {
      const mediaStorage = renderWithMockBackend()
      const [onlyBook] = Object.values(earthsea.items ?? {})

      act(() => {
        mediaStorage.current?.moveBookToMainList(onlyBook)
      })

      const books = mediaStorage.current?.books ?? []
      expect(books).toContainEqual(onlyBook)
      expect(books.map((book) => book.id)).not.toContain(earthsea.id)
    })

    it("moving the last game out of a series removes the series", () => {
      const mediaStorage = renderWithMockBackend()
      const [onlyGame] = Object.values(portal.items ?? {})

      act(() => {
        mediaStorage.current?.moveGameToSeries(onlyGame, zelda.id)
      })

      const gameSeries = mediaStorage.current?.gameSeries ?? []
      expect(gameSeries.map((series) => series.id)).toEqual([zelda.id])
      expect(Object.keys(gameSeries[0].items ?? {}).sort()).toEqual(
        [botw.id, onlyGame.id, totk.id].sort(),
      )
    })
  })
})
