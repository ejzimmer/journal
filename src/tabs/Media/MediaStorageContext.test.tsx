import { renderHook } from "@testing-library/react"
import { ContextType } from "../../shared/FirebaseContext"
import { StorageContextWrapper } from "../../shared/storageContextTestUtils"
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

const createMediaStorage = (storage: Partial<ContextType> = {}) =>
  renderHook(useMediaStorage, {
    wrapper: ({ children }) => (
      <StorageContextWrapper value={storage}>
        <MediaStorageProvider>{children}</MediaStorageProvider>
      </StorageContextWrapper>
    ),
  }).result.current

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

  describe("addMedia", () => {
    it("writes a book to the books key", () => {
      const addItem = jest.fn()
      const mediaStorage = createMediaStorage({ addItem })

      mediaStorage.addMedia({
        type: "book",
        title: "Thud!",
        author: "Terry Pratchett",
      })

      expect(addItem).toHaveBeenCalledWith(BOOKS_KEY, {
        type: "book",
        title: "Thud!",
        author: "Terry Pratchett",
      })
    })

    it("writes a game to the games key", () => {
      const addItem = jest.fn()
      const mediaStorage = createMediaStorage({ addItem })

      mediaStorage.addMedia({ type: "game", title: "Hades" })

      expect(addItem).toHaveBeenCalledWith(GAMES_KEY, {
        type: "game",
        title: "Hades",
      })
    })

    it("writes under the series items when given a series", () => {
      const addItem = jest.fn()
      const mediaStorage = createMediaStorage({ addItem })

      mediaStorage.addMedia(
        { type: "book", title: "Thud!" },
        "series-discworld",
      )

      expect(addItem).toHaveBeenCalledWith(
        `${BOOKS_KEY}/series-discworld/items`,
        { type: "book", title: "Thud!" },
      )
    })
  })

  describe("addMediaSeries", () => {
    it("creates the series and puts the media in it", () => {
      const addItem = jest.fn(() => "new-series")
      const mediaStorage = createMediaStorage({ addItem })

      mediaStorage.addMediaSeries("Tiffany Aching", {
        type: "book",
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
  })

  describe("deleteMedia", () => {
    it("removes standalone media from the main list", () => {
      const deleteItem = jest.fn()
      const nation = createBook("book-nation", "Nation")
      const mediaStorage = createMediaStorage({
        ...createStoredMedia({ books: [nation] }),
        deleteItem,
      })

      mediaStorage.deleteMedia(nation)

      expect(deleteItem).toHaveBeenCalledWith(BOOKS_KEY, nation)
    })

    it("removes media from its series", () => {
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

      mediaStorage.deleteMedia(guards)

      expect(deleteItem).toHaveBeenCalledWith(
        `${BOOKS_KEY}/series-discworld/items`,
        guards,
      )
    })

    it("deletes the series when the media was the last thing in it", () => {
      const deleteItem = jest.fn()
      const portalGame = createGame("game-portal", "Portal")
      const portal = createSeries("series-portal", "Portal", [portalGame])
      const mediaStorage = createMediaStorage({
        ...createStoredMedia({ games: [portal] }),
        deleteItem,
      })

      mediaStorage.deleteMedia(portalGame)

      expect(deleteItem).toHaveBeenCalledTimes(1)
      expect(deleteItem).toHaveBeenCalledWith(GAMES_KEY, portal)
    })
  })

  describe("moveMedia", () => {
    const guards = createBook("book-guards", "Guards! Guards!")
    const nightWatch = createBook("book-nightwatch", "Night Watch")
    const discworld = createSeries("series-discworld", "Discworld", [
      guards,
      nightWatch,
    ])

    it("writes the media to the new series and removes it from the old one", () => {
      const updateItem = jest.fn()
      const deleteItem = jest.fn()
      const mediaStorage = createMediaStorage({
        ...createStoredMedia({ books: [discworld] }),
        updateItem,
        deleteItem,
      })

      mediaStorage.moveMedia(guards, "series-earthsea")

      expect(updateItem).toHaveBeenCalledWith(
        `${BOOKS_KEY}/series-earthsea/items`,
        guards,
      )
      expect(deleteItem).toHaveBeenCalledWith(
        `${BOOKS_KEY}/series-discworld/items`,
        guards,
      )
    })

    it("moves standalone media into a series", () => {
      const updateItem = jest.fn()
      const deleteItem = jest.fn()
      const nation = createBook("book-nation", "Nation")
      const mediaStorage = createMediaStorage({
        ...createStoredMedia({ books: [nation] }),
        updateItem,
        deleteItem,
      })

      mediaStorage.moveMedia(nation, "series-discworld")

      expect(updateItem).toHaveBeenCalledWith(
        `${BOOKS_KEY}/series-discworld/items`,
        nation,
      )
      expect(deleteItem).toHaveBeenCalledWith(BOOKS_KEY, nation)
    })

    it("moves media back to the main list when given no series", () => {
      const updateItem = jest.fn()
      const deleteItem = jest.fn()
      const mediaStorage = createMediaStorage({
        ...createStoredMedia({ books: [discworld] }),
        updateItem,
        deleteItem,
      })

      mediaStorage.moveMedia(guards)

      expect(updateItem).toHaveBeenCalledWith(BOOKS_KEY, guards)
      expect(deleteItem).toHaveBeenCalledWith(
        `${BOOKS_KEY}/series-discworld/items`,
        guards,
      )
    })

    it("deletes the old series when the media was the last thing in it", () => {
      const updateItem = jest.fn()
      const deleteItem = jest.fn()
      const wizard = createBook("book-wizard", "A Wizard of Earthsea")
      const earthsea = createSeries("series-earthsea", "Earthsea", [wizard])
      const mediaStorage = createMediaStorage({
        ...createStoredMedia({ books: [earthsea] }),
        updateItem,
        deleteItem,
      })

      mediaStorage.moveMedia(wizard, "series-discworld")

      expect(updateItem).toHaveBeenCalledWith(
        `${BOOKS_KEY}/series-discworld/items`,
        wizard,
      )
      expect(deleteItem).toHaveBeenCalledTimes(1)
      expect(deleteItem).toHaveBeenCalledWith(BOOKS_KEY, earthsea)
    })

    it("deletes the old series when its last media moves to the main list", () => {
      const updateItem = jest.fn()
      const deleteItem = jest.fn()
      const wizard = createBook("book-wizard", "A Wizard of Earthsea")
      const earthsea = createSeries("series-earthsea", "Earthsea", [wizard])
      const mediaStorage = createMediaStorage({
        ...createStoredMedia({ books: [earthsea] }),
        updateItem,
        deleteItem,
      })

      mediaStorage.moveMedia(wizard)

      expect(updateItem).toHaveBeenCalledWith(BOOKS_KEY, wizard)
      expect(deleteItem).toHaveBeenCalledTimes(1)
      expect(deleteItem).toHaveBeenCalledWith(BOOKS_KEY, earthsea)
    })

    it("does nothing when the media is already in that series", () => {
      const updateItem = jest.fn()
      const deleteItem = jest.fn()
      const mediaStorage = createMediaStorage({
        ...createStoredMedia({ books: [discworld] }),
        updateItem,
        deleteItem,
      })

      mediaStorage.moveMedia(guards, "series-discworld")

      expect(updateItem).not.toHaveBeenCalled()
      expect(deleteItem).not.toHaveBeenCalled()
    })

    it("does nothing when the media is already in the main list", () => {
      const updateItem = jest.fn()
      const deleteItem = jest.fn()
      const nation = createBook("book-nation", "Nation")
      const mediaStorage = createMediaStorage({
        ...createStoredMedia({ books: [nation] }),
        updateItem,
        deleteItem,
      })

      mediaStorage.moveMedia(nation)

      expect(updateItem).not.toHaveBeenCalled()
      expect(deleteItem).not.toHaveBeenCalled()
    })
  })
})
