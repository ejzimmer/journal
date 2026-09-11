import { act } from "react"
import { renderHook } from "@testing-library/react"
import { ContextType } from "../../shared/FirebaseContext"
import { StorageContextWrapper } from "../../shared/storageContextTestUtils"
import { createMockFirebaseContext } from "../../shared/mockFirebase"
import { MediaStorageProvider, useMediaStorage } from "./MediaStorageContext"
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

const indexById = <T extends { id: string }>(items: T[]): Record<string, T> =>
  Object.fromEntries(items.map((item) => [item.id, item]))

const createSeries = <T extends BookDetails | GameDetails>(
  id: string,
  name: string,
  items: T[],
): SeriesDetails<T> => ({ id, type: "series", name, items: indexById(items) })

const createStoredMedia = ({
  books = [],
  games = [],
}: {
  books?: ReadingItemDetails[]
  games?: PlayingItemDetails[]
}): Partial<ContextType> => ({
  useValue: <T,>(key?: string) => ({
    value: indexById<ReadingItemDetails | PlayingItemDetails>(
      key === GAMES_KEY ? games : books,
    ) as T,
    loading: false,
  }),
})

function renderMediaStorage(storage: Partial<ContextType> = {}) {
  const { result } = renderHook(useMediaStorage, {
    wrapper: ({ children }) => (
      <StorageContextWrapper value={storage}>
        <MediaStorageProvider>{children}</MediaStorageProvider>
      </StorageContextWrapper>
    ),
  })
  return result
}

const createMediaStorage = (storage: Partial<ContextType> = {}) =>
  renderMediaStorage(storage).current

describe("MediaStorageContext", () => {
  it("throws when the hook is used outside a provider", () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation()

    expect(() => renderHook(useMediaStorage)).toThrow(
      "missing MediaStorageContext provider",
    )

    errorSpy.mockRestore()
  })

  describe("reading the lists", () => {
    it("returns the books and the games", () => {
      const nation = createBook("book-nation", "Nation")
      const stardew = createGame("game-stardew", "Stardew Valley")
      const mediaStorage = createMediaStorage(
        createStoredMedia({ books: [nation], games: [stardew] }),
      )

      expect(mediaStorage.books).toEqual([nation])
      expect(mediaStorage.games).toEqual([stardew])
    })

    it("returns empty lists when nothing is stored", () => {
      const mediaStorage = createMediaStorage()

      expect(mediaStorage.books).toEqual([])
      expect(mediaStorage.games).toEqual([])
    })

    it("returns the book series and the game series", () => {
      const discworld = createSeries("series-discworld", "Discworld", [
        createBook("book-guards", "Guards! Guards!"),
      ])
      const zelda = createSeries("series-zelda", "The Legend of Zelda", [
        createGame("game-botw", "Breath of the Wild"),
      ])
      const mediaStorage = createMediaStorage(
        createStoredMedia({
          books: [discworld, createBook("book-nation", "Nation")],
          games: [zelda, createGame("game-stardew", "Stardew Valley")],
        }),
      )

      expect(mediaStorage.bookSeries).toEqual([discworld])
      expect(mediaStorage.gameSeries).toEqual([zelda])
    })

    it("returns the authors of every book, including books in a series", () => {
      const mediaStorage = createMediaStorage(
        createStoredMedia({
          books: [
            createSeries("series-earthsea", "Earthsea", [
              createBook("book-wizard", "A Wizard of Earthsea", {
                author: "Ursula Le Guin",
              }),
            ]),
            createBook("book-nation", "Nation", { author: "Terry Pratchett" }),
          ],
        }),
      )

      expect(mediaStorage.authors).toEqual([
        "Ursula Le Guin",
        "Terry Pratchett",
      ])
    })

    it("leaves books without an author out of the authors list", () => {
      const mediaStorage = createMediaStorage(
        createStoredMedia({
          books: [
            createBook("book-beowulf", "Beowulf"),
            createBook("book-nation", "Nation", { author: "Terry Pratchett" }),
          ],
        }),
      )

      expect(mediaStorage.authors).toEqual(["Terry Pratchett"])
    })
  })

  describe("adding to the main list", () => {
    it("addBook writes a book to the books key", () => {
      const addItem = jest.fn()
      const mediaStorage = createMediaStorage({ addItem })

      mediaStorage.addBook({ title: "Thud!", author: "Terry Pratchett" })

      expect(addItem).toHaveBeenCalledWith(BOOKS_KEY, {
        type: "book",
        title: "Thud!",
        author: "Terry Pratchett",
      })
    })

    it("addGame writes a game to the games key", () => {
      const addItem = jest.fn()
      const mediaStorage = createMediaStorage({ addItem })

      mediaStorage.addGame({ title: "Hades" })

      expect(addItem).toHaveBeenCalledWith(GAMES_KEY, {
        type: "game",
        title: "Hades",
      })
    })
  })

  describe("adding a series", () => {
    it("addBookSeries creates the series and puts the book in it", () => {
      const addItem = jest.fn(() => "new-series")
      const mediaStorage = createMediaStorage({ addItem })

      mediaStorage.addBookSeries("Tiffany Aching", {
        title: "The Wee Free Men",
      })

      expect(addItem).toHaveBeenNthCalledWith(1, BOOKS_KEY, {
        type: "series",
        name: "Tiffany Aching",
      })
      expect(addItem).toHaveBeenNthCalledWith(
        2,
        `${BOOKS_KEY}/new-series/items`,
        { type: "book", title: "The Wee Free Men" },
      )
    })

    it("addGameSeries creates the series and puts the game in it", () => {
      const addItem = jest.fn(() => "new-series")
      const mediaStorage = createMediaStorage({ addItem })

      mediaStorage.addGameSeries("Metroid", { title: "Dread" })

      expect(addItem).toHaveBeenNthCalledWith(1, GAMES_KEY, {
        type: "series",
        name: "Metroid",
      })
      expect(addItem).toHaveBeenNthCalledWith(
        2,
        `${GAMES_KEY}/new-series/items`,
        { type: "game", title: "Dread" },
      )
    })
  })

  describe("adding to an existing series", () => {
    it("addBookToSeries writes the book under the series items", () => {
      const addItem = jest.fn()
      const mediaStorage = createMediaStorage({ addItem })

      mediaStorage.addBookToSeries("series-discworld", { title: "Thud!" })

      expect(addItem).toHaveBeenCalledWith(
        `${BOOKS_KEY}/series-discworld/items`,
        { type: "book", title: "Thud!" },
      )
    })

    it("addGameToSeries writes the game under the series items", () => {
      const addItem = jest.fn()
      const mediaStorage = createMediaStorage({ addItem })

      mediaStorage.addGameToSeries("series-zelda", {
        title: "Echoes of Wisdom",
      })

      expect(addItem).toHaveBeenCalledWith(`${GAMES_KEY}/series-zelda/items`, {
        type: "game",
        title: "Echoes of Wisdom",
      })
    })
  })

  describe("deleting", () => {
    it("deleteBook removes a standalone book from the books key", () => {
      const deleteItem = jest.fn()
      const nation = createBook("book-nation", "Nation")
      const mediaStorage = createMediaStorage({
        ...createStoredMedia({ books: [nation] }),
        deleteItem,
      })

      mediaStorage.deleteBook(nation)

      expect(deleteItem).toHaveBeenCalledWith(BOOKS_KEY, nation)
    })

    it("deleteBook removes a book from its series", () => {
      const deleteItem = jest.fn()
      const guards = createBook("book-guards", "Guards! Guards!")
      const discworld = createSeries("series-discworld", "Discworld", [
        guards,
        createBook("book-nightwatch", "Night Watch"),
      ])
      const mediaStorage = createMediaStorage({
        ...createStoredMedia({ books: [discworld] }),
        deleteItem,
      })

      mediaStorage.deleteBook(guards)

      expect(deleteItem).toHaveBeenCalledWith(
        `${BOOKS_KEY}/series-discworld/items`,
        guards,
      )
    })

    it("deleteBook deletes the series when the book was the last one in it", () => {
      const deleteItem = jest.fn()
      const wizard = createBook("book-wizard", "A Wizard of Earthsea")
      const earthsea = createSeries("series-earthsea", "Earthsea", [wizard])
      const mediaStorage = createMediaStorage({
        ...createStoredMedia({ books: [earthsea] }),
        deleteItem,
      })

      mediaStorage.deleteBook(wizard)

      expect(deleteItem).toHaveBeenCalledTimes(1)
      expect(deleteItem).toHaveBeenCalledWith(BOOKS_KEY, earthsea)
    })

    it("deleteGame removes a standalone game from the games key", () => {
      const deleteItem = jest.fn()
      const stardew = createGame("game-stardew", "Stardew Valley")
      const mediaStorage = createMediaStorage({
        ...createStoredMedia({ games: [stardew] }),
        deleteItem,
      })

      mediaStorage.deleteGame(stardew)

      expect(deleteItem).toHaveBeenCalledWith(GAMES_KEY, stardew)
    })

    it("deleteGame removes a game from its series", () => {
      const deleteItem = jest.fn()
      const botw = createGame("game-botw", "Breath of the Wild")
      const zelda = createSeries("series-zelda", "The Legend of Zelda", [
        botw,
        createGame("game-totk", "Tears of the Kingdom"),
      ])
      const mediaStorage = createMediaStorage({
        ...createStoredMedia({ games: [zelda] }),
        deleteItem,
      })

      mediaStorage.deleteGame(botw)

      expect(deleteItem).toHaveBeenCalledWith(
        `${GAMES_KEY}/series-zelda/items`,
        botw,
      )
    })

    it("deleteGame deletes the series when the game was the last one in it", () => {
      const deleteItem = jest.fn()
      const portalGame = createGame("game-portal", "Portal")
      const portal = createSeries("series-portal", "Portal", [portalGame])
      const mediaStorage = createMediaStorage({
        ...createStoredMedia({ games: [portal] }),
        deleteItem,
      })

      mediaStorage.deleteGame(portalGame)

      expect(deleteItem).toHaveBeenCalledTimes(1)
      expect(deleteItem).toHaveBeenCalledWith(GAMES_KEY, portal)
    })
  })

  describe("moving to another series", () => {
    it("moveBookToSeries writes the book to the new series and removes it from the old one", () => {
      const updateItem = jest.fn()
      const deleteItem = jest.fn()
      const guards = createBook("book-guards", "Guards! Guards!")
      const discworld = createSeries("series-discworld", "Discworld", [
        guards,
        createBook("book-nightwatch", "Night Watch"),
      ])
      const mediaStorage = createMediaStorage({
        ...createStoredMedia({ books: [discworld] }),
        updateItem,
        deleteItem,
      })

      mediaStorage.moveBookToSeries(guards, "series-earthsea")

      expect(updateItem).toHaveBeenCalledWith(
        `${BOOKS_KEY}/series-earthsea/items`,
        guards,
      )
      expect(deleteItem).toHaveBeenCalledWith(
        `${BOOKS_KEY}/series-discworld/items`,
        guards,
      )
    })

    it("moveBookToSeries deletes the old series when the book was the last one in it", () => {
      const updateItem = jest.fn()
      const deleteItem = jest.fn()
      const wizard = createBook("book-wizard", "A Wizard of Earthsea")
      const earthsea = createSeries("series-earthsea", "Earthsea", [wizard])
      const mediaStorage = createMediaStorage({
        ...createStoredMedia({ books: [earthsea] }),
        updateItem,
        deleteItem,
      })

      mediaStorage.moveBookToSeries(wizard, "series-discworld")

      expect(updateItem).toHaveBeenCalledWith(
        `${BOOKS_KEY}/series-discworld/items`,
        wizard,
      )
      expect(deleteItem).toHaveBeenCalledTimes(1)
      expect(deleteItem).toHaveBeenCalledWith(BOOKS_KEY, earthsea)
    })

    it("moveBookToSeries moves a standalone book into the series", () => {
      const updateItem = jest.fn()
      const deleteItem = jest.fn()
      const nation = createBook("book-nation", "Nation")
      const mediaStorage = createMediaStorage({
        ...createStoredMedia({ books: [nation] }),
        updateItem,
        deleteItem,
      })

      mediaStorage.moveBookToSeries(nation, "series-discworld")

      expect(updateItem).toHaveBeenCalledWith(
        `${BOOKS_KEY}/series-discworld/items`,
        nation,
      )
      expect(deleteItem).toHaveBeenCalledWith(BOOKS_KEY, nation)
    })

    it("moveBookToSeries does nothing when the book is already in that series", () => {
      const updateItem = jest.fn()
      const deleteItem = jest.fn()
      const guards = createBook("book-guards", "Guards! Guards!")
      const discworld = createSeries("series-discworld", "Discworld", [guards])
      const mediaStorage = createMediaStorage({
        ...createStoredMedia({ books: [discworld] }),
        updateItem,
        deleteItem,
      })

      mediaStorage.moveBookToSeries(guards, "series-discworld")

      expect(updateItem).not.toHaveBeenCalled()
      expect(deleteItem).not.toHaveBeenCalled()
    })

    it("moveGameToSeries writes the game to the new series and removes it from the old one", () => {
      const updateItem = jest.fn()
      const deleteItem = jest.fn()
      const botw = createGame("game-botw", "Breath of the Wild")
      const zelda = createSeries("series-zelda", "The Legend of Zelda", [
        botw,
        createGame("game-totk", "Tears of the Kingdom"),
      ])
      const mediaStorage = createMediaStorage({
        ...createStoredMedia({ games: [zelda] }),
        updateItem,
        deleteItem,
      })

      mediaStorage.moveGameToSeries(botw, "series-portal")

      expect(updateItem).toHaveBeenCalledWith(
        `${GAMES_KEY}/series-portal/items`,
        botw,
      )
      expect(deleteItem).toHaveBeenCalledWith(
        `${GAMES_KEY}/series-zelda/items`,
        botw,
      )
    })

    it("moveGameToSeries deletes the old series when the game was the last one in it", () => {
      const updateItem = jest.fn()
      const deleteItem = jest.fn()
      const portalGame = createGame("game-portal", "Portal")
      const portal = createSeries("series-portal", "Portal", [portalGame])
      const mediaStorage = createMediaStorage({
        ...createStoredMedia({ games: [portal] }),
        updateItem,
        deleteItem,
      })

      mediaStorage.moveGameToSeries(portalGame, "series-zelda")

      expect(updateItem).toHaveBeenCalledWith(
        `${GAMES_KEY}/series-zelda/items`,
        portalGame,
      )
      expect(deleteItem).toHaveBeenCalledTimes(1)
      expect(deleteItem).toHaveBeenCalledWith(GAMES_KEY, portal)
    })
  })

  describe("moving back to the main list", () => {
    it("moveBookToMainList writes the book to the books key and removes it from its series", () => {
      const updateItem = jest.fn()
      const deleteItem = jest.fn()
      const guards = createBook("book-guards", "Guards! Guards!")
      const discworld = createSeries("series-discworld", "Discworld", [
        guards,
        createBook("book-nightwatch", "Night Watch"),
      ])
      const mediaStorage = createMediaStorage({
        ...createStoredMedia({ books: [discworld] }),
        updateItem,
        deleteItem,
      })

      mediaStorage.moveBookToMainList(guards)

      expect(updateItem).toHaveBeenCalledWith(BOOKS_KEY, guards)
      expect(deleteItem).toHaveBeenCalledWith(
        `${BOOKS_KEY}/series-discworld/items`,
        guards,
      )
    })

    it("moveBookToMainList deletes the series when the book was the last one in it", () => {
      const updateItem = jest.fn()
      const deleteItem = jest.fn()
      const wizard = createBook("book-wizard", "A Wizard of Earthsea")
      const earthsea = createSeries("series-earthsea", "Earthsea", [wizard])
      const mediaStorage = createMediaStorage({
        ...createStoredMedia({ books: [earthsea] }),
        updateItem,
        deleteItem,
      })

      mediaStorage.moveBookToMainList(wizard)

      expect(updateItem).toHaveBeenCalledWith(BOOKS_KEY, wizard)
      expect(deleteItem).toHaveBeenCalledTimes(1)
      expect(deleteItem).toHaveBeenCalledWith(BOOKS_KEY, earthsea)
    })

    it("moveBookToMainList does nothing when the book is already in the main list", () => {
      const updateItem = jest.fn()
      const deleteItem = jest.fn()
      const nation = createBook("book-nation", "Nation")
      const mediaStorage = createMediaStorage({
        ...createStoredMedia({ books: [nation] }),
        updateItem,
        deleteItem,
      })

      mediaStorage.moveBookToMainList(nation)

      expect(updateItem).not.toHaveBeenCalled()
      expect(deleteItem).not.toHaveBeenCalled()
    })

    it("moveGameToMainList writes the game to the games key and removes it from its series", () => {
      const updateItem = jest.fn()
      const deleteItem = jest.fn()
      const botw = createGame("game-botw", "Breath of the Wild")
      const zelda = createSeries("series-zelda", "The Legend of Zelda", [
        botw,
        createGame("game-totk", "Tears of the Kingdom"),
      ])
      const mediaStorage = createMediaStorage({
        ...createStoredMedia({ games: [zelda] }),
        updateItem,
        deleteItem,
      })

      mediaStorage.moveGameToMainList(botw)

      expect(updateItem).toHaveBeenCalledWith(GAMES_KEY, botw)
      expect(deleteItem).toHaveBeenCalledWith(
        `${GAMES_KEY}/series-zelda/items`,
        botw,
      )
    })

    it("moveGameToMainList deletes the series when the game was the last one in it", () => {
      const updateItem = jest.fn()
      const deleteItem = jest.fn()
      const portalGame = createGame("game-portal", "Portal")
      const portal = createSeries("series-portal", "Portal", [portalGame])
      const mediaStorage = createMediaStorage({
        ...createStoredMedia({ games: [portal] }),
        updateItem,
        deleteItem,
      })

      mediaStorage.moveGameToMainList(portalGame)

      expect(updateItem).toHaveBeenCalledWith(GAMES_KEY, portalGame)
      expect(deleteItem).toHaveBeenCalledTimes(1)
      expect(deleteItem).toHaveBeenCalledWith(GAMES_KEY, portal)
    })

    it("moveGameToMainList does nothing when the game is already in the main list", () => {
      const updateItem = jest.fn()
      const deleteItem = jest.fn()
      const stardew = createGame("game-stardew", "Stardew Valley")
      const mediaStorage = createMediaStorage({
        ...createStoredMedia({ games: [stardew] }),
        updateItem,
        deleteItem,
      })

      mediaStorage.moveGameToMainList(stardew)

      expect(updateItem).not.toHaveBeenCalled()
      expect(deleteItem).not.toHaveBeenCalled()
    })
  })

  describe("against the mock backend", () => {
    const guards = createBook("book-guards", "Guards! Guards!")
    const nightWatch = createBook("book-nightwatch", "Night Watch")
    const discworld = createSeries("series-discworld", "Discworld", [
      guards,
      nightWatch,
    ])
    const wizard = createBook("book-wizard", "A Wizard of Earthsea")
    const earthsea = createSeries("series-earthsea", "Earthsea", [wizard])
    const portalGame = createGame("game-portal", "Portal")
    const portal = createSeries("series-portal", "Portal", [portalGame])
    const botw = createGame("game-botw", "Breath of the Wild")
    const zelda = createSeries("series-zelda", "The Legend of Zelda", [botw])

    const renderWithMockBackend = () =>
      renderMediaStorage(
        createMockFirebaseContext({
          media: {
            books: indexById<ReadingItemDetails>([discworld, earthsea]),
            games: indexById<PlayingItemDetails>([zelda, portal]),
          },
        }),
      )

    it("adding a series leaves the series holding the new book", () => {
      const mediaStorage = renderWithMockBackend()

      act(() => {
        mediaStorage.current.addBookSeries("Tiffany Aching", {
          title: "The Wee Free Men",
        })
      })

      const series = mediaStorage.current.bookSeries.find(
        (series) => series.name === "Tiffany Aching",
      )
      expect(Object.values(series?.items ?? {})).toEqual([
        expect.objectContaining({ type: "book", title: "The Wee Free Men" }),
      ])
    })

    it("deleting the last book in a series removes the series", () => {
      const mediaStorage = renderWithMockBackend()

      act(() => {
        mediaStorage.current.deleteBook(wizard)
      })

      expect(mediaStorage.current.books).toEqual([discworld])
    })

    it("moving a book keeps it in the new series only", () => {
      const mediaStorage = renderWithMockBackend()

      act(() => {
        mediaStorage.current.moveBookToSeries(guards, earthsea.id)
      })

      const seriesItems = (id: string) =>
        Object.keys(
          mediaStorage.current.bookSeries.find((series) => series.id === id)
            ?.items ?? {},
        ).sort()

      expect(seriesItems(discworld.id)).toEqual([nightWatch.id])
      expect(seriesItems(earthsea.id)).toEqual([guards.id, wizard.id].sort())
    })

    it("moving a book to the main list leaves it alongside its old series", () => {
      const mediaStorage = renderWithMockBackend()

      act(() => {
        mediaStorage.current.moveBookToMainList(guards)
      })

      expect(mediaStorage.current.books).toContainEqual(guards)
      const [remainingSeries] = mediaStorage.current.bookSeries.filter(
        (series) => series.id === discworld.id,
      )
      expect(Object.keys(remainingSeries.items ?? {})).toEqual([nightWatch.id])
    })

    it("moving the last book in a series to the main list removes the series", () => {
      const mediaStorage = renderWithMockBackend()

      act(() => {
        mediaStorage.current.moveBookToMainList(wizard)
      })

      expect(mediaStorage.current.books).toContainEqual(wizard)
      expect(mediaStorage.current.books.map(({ id }) => id)).not.toContain(
        earthsea.id,
      )
    })

    it("moving the last game out of a series removes the series", () => {
      const mediaStorage = renderWithMockBackend()

      act(() => {
        mediaStorage.current.moveGameToSeries(portalGame, zelda.id)
      })

      expect(mediaStorage.current.gameSeries.map(({ id }) => id)).toEqual([
        zelda.id,
      ])
      expect(
        Object.keys(mediaStorage.current.gameSeries[0].items ?? {}).sort(),
      ).toEqual([botw.id, portalGame.id].sort())
    })
  })
})
