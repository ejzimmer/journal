import { renderHook } from "@testing-library/react"
import {
  flattenBookAuthors,
  StoredReadingItem,
  useFlattenBookAuthors,
} from "./flattenBookAuthors"
import { BOOKS_KEY } from "../tabs/Media/types"
import { StorageContextWrapper } from "../shared/storageContextTestUtils"

const byId = <T extends { id: string }>(items: T[]) =>
  Object.fromEntries(items.map((item) => [item.id, item]))

describe("flattenBookAuthors", () => {
  describe("a book stored under an author", () => {
    it("moves the book to the top level, with the author as a field", () => {
      const books = byId<StoredReadingItem>([
        {
          id: "author-1",
          type: "author",
          name: "Mary Shelley",
          items: byId([
            { id: "book-1", type: "book", title: "Frankenstein", isDone: true },
          ]),
        },
      ])

      expect(flattenBookAuthors(books)).toEqual({
        "book-1": {
          id: "book-1",
          type: "book",
          title: "Frankenstein",
          author: "Mary Shelley",
          isDone: true,
        },
      })
    })
  })

  describe("a series stored under an author", () => {
    it("moves the series to the top level and adds the author to each of its books", () => {
      const books = byId<StoredReadingItem>([
        {
          id: "author-1",
          type: "author",
          name: "Tamsyn Muir",
          items: byId([
            {
              id: "series-1",
              type: "series",
              name: "The Locked Tomb",
              items: byId([
                {
                  id: "book-1",
                  type: "book",
                  title: "Gideon the Ninth",
                  medium: "🎧" as const,
                },
                { id: "book-2", type: "book", title: "Harrow the Ninth" },
              ]),
            },
          ]),
        },
      ])

      expect(flattenBookAuthors(books)).toEqual({
        "series-1": {
          id: "series-1",
          type: "series",
          name: "The Locked Tomb",
          items: {
            "book-1": {
              id: "book-1",
              type: "book",
              title: "Gideon the Ninth",
              author: "Tamsyn Muir",
              medium: "🎧",
            },
            "book-2": {
              id: "book-2",
              type: "book",
              title: "Harrow the Ninth",
              author: "Tamsyn Muir",
            },
          },
        },
      })
    })
  })

  describe("an author with both books and series", () => {
    it("moves all of them to the top level", () => {
      const books = byId<StoredReadingItem>([
        {
          id: "author-1",
          type: "author",
          name: "Terry Pratchett",
          items: byId([
            {
              id: "series-1",
              type: "series",
              name: "Discworld",
              items: byId([
                { id: "book-1", type: "book", title: "Guards! Guards!" },
              ]),
            },
            { id: "book-2", type: "book", title: "Nation" },
          ]),
        },
      ])

      expect(Object.keys(flattenBookAuthors(books)!)).toEqual([
        "series-1",
        "book-2",
      ])
    })
  })

  describe("items already at the top level", () => {
    it("leaves them alone", () => {
      const books = byId<StoredReadingItem>([
        { id: "book-1", type: "book", title: "The Linguist Mages" },
        { id: "series-1", type: "series", name: "Earthsea" },
        { id: "author-1", type: "author", name: "Mary Shelley" },
      ])

      expect(flattenBookAuthors(books)).toEqual({
        "book-1": { id: "book-1", type: "book", title: "The Linguist Mages" },
        "series-1": { id: "series-1", type: "series", name: "Earthsea" },
      })
    })
  })

  describe("when there are no authors left to migrate", () => {
    it("has nothing to do", () => {
      const books = byId<StoredReadingItem>([
        { id: "book-1", type: "book", title: "Nation", author: "Terry Pratchett" },
      ])

      expect(flattenBookAuthors(books)).toBeUndefined()
    })
  })
})

describe("useFlattenBookAuthors", () => {
  const renderMigration = (
    value: Record<string, StoredReadingItem> | undefined,
    setValue: jest.Mock,
  ) =>
    renderHook(() => useFlattenBookAuthors(), {
      wrapper: ({ children }) => (
        <StorageContextWrapper
          value={{
            setValue,
            useValue: <T,>() => ({ value: value as T, loading: false }),
          }}
        >
          {children}
        </StorageContextWrapper>
      ),
    })

  describe("when books are stored under authors", () => {
    it("writes the flattened books back", () => {
      const setValue = jest.fn()
      renderMigration(
        byId<StoredReadingItem>([
          {
            id: "author-1",
            type: "author",
            name: "Mary Shelley",
            items: byId([
              { id: "book-1", type: "book", title: "Frankenstein" },
            ]),
          },
        ]),
        setValue,
      )

      expect(setValue).toHaveBeenCalledWith(BOOKS_KEY, {
        "book-1": {
          id: "book-1",
          type: "book",
          title: "Frankenstein",
          author: "Mary Shelley",
        },
      })
    })
  })

  describe("when the books have already been migrated", () => {
    it("doesn't write anything", () => {
      const setValue = jest.fn()
      renderMigration(
        byId<StoredReadingItem>([
          { id: "book-1", type: "book", title: "Frankenstein" },
        ]),
        setValue,
      )

      expect(setValue).not.toHaveBeenCalled()
    })
  })

  describe("when there are no books yet", () => {
    it("doesn't write anything", () => {
      const setValue = jest.fn()
      renderMigration(undefined, setValue)

      expect(setValue).not.toHaveBeenCalled()
    })
  })
})
