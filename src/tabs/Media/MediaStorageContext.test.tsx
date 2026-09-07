import { renderHook } from "@testing-library/react"
import { ReactNode } from "react"
import { ContextType, FirebaseContext } from "../../shared/FirebaseContext"
import { createStorageContext } from "../../shared/storageContextTestUtils"
import { MediaStorageProvider, useMediaStorage } from "./MediaStorageContext"
import { BookDetails, BOOKS_KEY, GAMES_KEY, ReadingItemDetails } from "./types"

const pratchett = {
  id: "pratchett",
  type: "author" as const,
  name: "Terry Pratchett",
  items: {
    discworld: {
      id: "discworld",
      type: "series" as const,
      name: "Discworld",
      items: {
        thud: { id: "thud", type: "book" as const, title: "Thud!" },
        guards: {
          id: "guards",
          type: "book" as const,
          title: "Guards! Guards!",
        },
      },
    },
    bromeliad: {
      id: "bromeliad",
      type: "series" as const,
      name: "Bromeliad",
      items: {
        truckers: { id: "truckers", type: "book" as const, title: "Truckers" },
      },
    },
    nation: { id: "nation", type: "book" as const, title: "Nation" },
  },
}

const muir = {
  id: "muir",
  type: "author" as const,
  name: "Tamsyn Muir",
  items: {
    lockedtomb: {
      id: "lockedtomb",
      type: "series" as const,
      name: "The Locked Tomb",
      items: {
        gideon: { id: "gideon", type: "book" as const, title: "Gideon" },
      },
    },
  },
}

const books: Record<string, ReadingItemDetails> = {
  pratchett,
  muir,
  leguin: { id: "leguin", type: "author", name: "Ursula Le Guin" },
  earthsea: { id: "earthsea", type: "series", name: "Earthsea" },
  orphan: { id: "orphan", type: "book", title: "The Linguist Mages" },
}

const games = {
  portal: {
    id: "portal",
    type: "series" as const,
    name: "Portal",
    items: {
      portal2: { id: "portal2", type: "game" as const, title: "Portal 2" },
    },
  },
}

const renderMediaStorage = (overrides: Partial<ContextType> = {}) => {
  const firebase = createStorageContext({
    useValue: <T,>(key?: string) => ({
      value: (key === BOOKS_KEY ? books : games) as T,
      loading: false,
    }),
    ...overrides,
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <FirebaseContext.Provider value={firebase}>
      <MediaStorageProvider>{children}</MediaStorageProvider>
    </FirebaseContext.Provider>
  )

  const { result } = renderHook(() => useMediaStorage(), { wrapper })
  return { storage: result.current, firebase }
}

describe("MediaStorageContext", () => {
  describe("addToList", () => {
    describe("when the list has no author or series", () => {
      it("adds the item to the root", () => {
        const addItem = jest.fn()
        const { storage } = renderMediaStorage({ addItem })

        storage.addToList<BookDetails>(
          { root: "books" },
          { type: "book", title: "Nona" },
        )

        expect(addItem).toHaveBeenCalledWith(BOOKS_KEY, {
          type: "book",
          title: "Nona",
        })
      })
    })

    describe("when the list names an author and series that already exist", () => {
      it("adds the item without creating either", () => {
        const addItem = jest.fn()
        const { storage } = renderMediaStorage({ addItem })

        storage.addToList<BookDetails>(
          {
            root: "books",
            author: { id: "pratchett", name: "Terry Pratchett" },
            series: { id: "discworld", name: "Discworld" },
          },
          { type: "book", title: "Jingo" },
        )

        expect(addItem).toHaveBeenCalledTimes(1)
        expect(addItem).toHaveBeenCalledWith(
          `${BOOKS_KEY}/pratchett/items/discworld/items`,
          { type: "book", title: "Jingo" },
        )
      })
    })

    describe("when the list names an author and series that don't exist yet", () => {
      it("creates each one on the way down and adds the item inside them", () => {
        const addItem = jest
          .fn()
          .mockImplementation((_path, { type }) =>
            type === "author" ? "new-author" : "new-series",
          )
        const { storage } = renderMediaStorage({ addItem })

        storage.addToList<BookDetails>(
          {
            root: "books",
            author: { id: "", name: "Douglas Adams" },
            series: { id: "", name: "Dirk Gently" },
          },
          { type: "book", title: "Long Dark Teatime" },
        )

        expect(addItem).toHaveBeenCalledWith(BOOKS_KEY, {
          type: "author",
          name: "Douglas Adams",
        })
        expect(addItem).toHaveBeenCalledWith(`${BOOKS_KEY}/new-author/items`, {
          type: "series",
          name: "Dirk Gently",
        })
        expect(addItem).toHaveBeenCalledWith(
          `${BOOKS_KEY}/new-author/items/new-series/items`,
          { type: "book", title: "Long Dark Teatime" },
        )
      })
    })
  })

  describe("removeFromList", () => {
    describe("when the list keeps other items", () => {
      it("removes only the item", () => {
        const deleteItem = jest.fn()
        const { storage } = renderMediaStorage({ deleteItem })

        storage.removeFromList(
          {
            root: "books",
            author: { id: "pratchett", name: "Terry Pratchett" },
            series: { id: "discworld", name: "Discworld" },
          },
          { id: "thud" },
        )

        expect(deleteItem).toHaveBeenCalledTimes(1)
        expect(deleteItem).toHaveBeenCalledWith(
          `${BOOKS_KEY}/pratchett/items/discworld/items`,
          { id: "thud" },
        )
      })
    })

    describe("when the item is the last one in its series", () => {
      describe("and the author has other items", () => {
        it("removes the series and leaves the author alone", () => {
          const deleteItem = jest.fn()
          const { storage } = renderMediaStorage({ deleteItem })

          storage.removeFromList(
            {
              root: "books",
              author: { id: "pratchett", name: "Terry Pratchett" },
              series: { id: "bromeliad", name: "Bromeliad" },
            },
            { id: "truckers" },
          )

          expect(deleteItem).toHaveBeenCalledTimes(1)
          expect(deleteItem).toHaveBeenCalledWith(
            `${BOOKS_KEY}/pratchett/items`,
            { id: "bromeliad", name: "Bromeliad" },
          )
        })
      })

      describe("and that series is all the author has", () => {
        it("removes the author, which takes the series with it", () => {
          const deleteItem = jest.fn()
          const { storage } = renderMediaStorage({ deleteItem })

          storage.removeFromList(
            {
              root: "books",
              author: { id: "muir", name: "Tamsyn Muir" },
              series: { id: "lockedtomb", name: "The Locked Tomb" },
            },
            { id: "gideon" },
          )

          expect(deleteItem).toHaveBeenCalledTimes(1)
          expect(deleteItem).toHaveBeenCalledWith(BOOKS_KEY, {
            id: "muir",
            name: "Tamsyn Muir",
          })
        })
      })
    })

    describe("when the item is the last game in its series", () => {
      it("removes the series", () => {
        const deleteItem = jest.fn()
        const { storage } = renderMediaStorage({ deleteItem })

        storage.removeFromList(
          { root: "games", series: { id: "portal", name: "Portal" } },
          { id: "portal2" },
        )

        expect(deleteItem).toHaveBeenCalledWith(GAMES_KEY, {
          id: "portal",
          name: "Portal",
        })
      })
    })
  })

  describe("moveToList", () => {
    describe("when the target list is where the item already is", () => {
      it("updates the item in place", () => {
        const updateItem = jest.fn()
        const moveItemBetweenLists = jest.fn()
        const { storage } = renderMediaStorage({
          updateItem,
          moveItemBetweenLists,
        })
        const list = {
          root: "books" as const,
          author: { id: "pratchett", name: "Terry Pratchett" },
        }

        storage.moveToList({ id: "nation", title: "Nation!" }, list, list)

        expect(updateItem).toHaveBeenCalledWith(
          `${BOOKS_KEY}/pratchett/items`,
          {
            id: "nation",
            title: "Nation!",
          },
        )
        expect(moveItemBetweenLists).not.toHaveBeenCalled()
      })
    })

    describe("when a book with no author is given one", () => {
      it("moves it into that author's items", () => {
        const moveItemBetweenLists = jest.fn()
        const { storage } = renderMediaStorage({ moveItemBetweenLists })

        storage.moveToList(
          { id: "orphan" },
          { root: "books" },
          {
            root: "books",
            author: { id: "leguin", name: "Ursula Le Guin" },
          },
        )

        expect(moveItemBetweenLists).toHaveBeenCalledWith({
          movedItem: { id: "orphan" },
          sourceListId: BOOKS_KEY,
          targetListId: `${BOOKS_KEY}/leguin/items`,
        })
      })
    })

    describe("when the move empties the series it came out of", () => {
      it("removes the series but keeps the author it is moving into", () => {
        const deleteItem = jest.fn()
        const addItem = jest.fn().mockReturnValue("ninth-house")
        const { storage } = renderMediaStorage({ deleteItem, addItem })

        storage.moveToList(
          { id: "gideon" },
          {
            root: "books",
            author: { id: "muir", name: "Tamsyn Muir" },
            series: { id: "lockedtomb", name: "The Locked Tomb" },
          },
          {
            root: "books",
            author: { id: "muir", name: "Tamsyn Muir" },
            series: { id: "", name: "Ninth House" },
          },
        )

        expect(deleteItem).toHaveBeenCalledTimes(1)
        expect(deleteItem).toHaveBeenCalledWith(`${BOOKS_KEY}/muir/items`, {
          id: "lockedtomb",
          name: "The Locked Tomb",
        })
      })
    })
  })

  describe("seriesIn", () => {
    it("offers only the series belonging to the given author", () => {
      const { storage } = renderMediaStorage()

      expect(
        storage.seriesIn({
          root: "books",
          author: { id: "pratchett", name: "Terry Pratchett" },
        }),
      ).toEqual([
        { id: "discworld", name: "Discworld" },
        { id: "bromeliad", name: "Bromeliad" },
      ])
    })

    it("offers the series with no author when no author is given", () => {
      const { storage } = renderMediaStorage()

      expect(storage.seriesIn({ root: "books" })).toEqual([
        { id: "earthsea", name: "Earthsea" },
      ])
    })
  })
})
