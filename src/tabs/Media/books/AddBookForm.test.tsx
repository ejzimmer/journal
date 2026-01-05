import { render, screen } from "@testing-library/react"
import { AddBookForm } from "./AddBookForm"
import userEvent from "@testing-library/user-event"
import { ReactNode } from "react"
import { ContextType, FirebaseContext } from "../../../shared/FirebaseContext"
import { BOOKS_KEY } from "../types"

const defaultMethods = {
  addItem: jest.fn(),
  updateItem: jest.fn(),
  deleteItem: jest.fn(),
  updateList: jest.fn(),
  useValue: () => ({
    value: {
      "1": {
        id: "1",
        type: "author",
        name: "Terry Pratchett",
        items: { "4": { id: "4", type: "series", name: "Discworld" } },
      },
      "2": { id: "2", type: "author", name: "Ursula Le Guin" },
      "3": { id: "3", type: "series", name: "Earthsea" },
    },
    loading: false,
  }),
} as ContextType

const getId = (_: string, { type }: any) =>
  type === "author" ? "author_id" : "series_id"

function Context({
  overrideMethods = {},
  children,
}: {
  overrideMethods: Partial<ContextType>
  children: ReactNode
}) {
  return (
    <FirebaseContext.Provider value={{ ...defaultMethods, ...overrideMethods }}>
      {children}
    </FirebaseContext.Provider>
  )
}

describe("AddBookForm", () => {
  describe("when the user enters a book title & submits the form", () => {
    it("creates a new book", async () => {
      const user = userEvent.setup()
      const addItem = jest.fn()
      render(<AddBookForm />, {
        wrapper: (props) => (
          <Context {...props} overrideMethods={{ addItem }} />
        ),
      })

      await user.type(
        screen.getByRole("textbox", { name: "Book title" }),
        "The Linguist Mages{Enter}"
      )

      expect(addItem).toHaveBeenCalledWith(BOOKS_KEY, {
        type: "book",
        title: "The Linguist Mages",
      })
    })
  })

  describe("when the user enters a new author & book title", () => {
    it("creates a new author and adds the new book to their items", async () => {
      const user = userEvent.setup()
      const addItem = jest.fn().mockReturnValue("1234")
      render(<AddBookForm />, {
        wrapper: (props) => (
          <Context {...props} overrideMethods={{ addItem }} />
        ),
      })

      await user.type(
        screen.getByRole("textbox", { name: "Book title" }),
        "Frankenstein"
      )
      await user.type(
        screen.getByRole("combobox", { name: "Author name" }),
        "Mary Shelley"
      )
      await user.click(screen.getByRole("button", { name: "Create" }))

      expect(addItem).toHaveBeenCalledWith(BOOKS_KEY, {
        type: "author",
        name: "Mary Shelley",
      })
      expect(addItem).toHaveBeenCalledWith(`${BOOKS_KEY}/1234/items`, {
        type: "book",
        title: "Frankenstein",
      })
    })
  })

  describe("when the user selects an existing author & enters a book title", () => {
    it("adds the new book to the existing author", async () => {
      const user = userEvent.setup()
      const addItem = jest.fn().mockReturnValue("1234")
      render(<AddBookForm />, {
        wrapper: (props) => (
          <Context {...props} overrideMethods={{ addItem }} />
        ),
      })

      await user.type(
        screen.getByRole("textbox", { name: "Book title" }),
        "The Left Hand of Darkness"
      )
      await user.click(screen.getByRole("option", { name: "Ursula Le Guin" }))
      await user.click(screen.getByRole("button", { name: "Create" }))

      expect(addItem).toHaveBeenCalledWith(`${BOOKS_KEY}/2/items`, {
        type: "book",
        title: "The Left Hand of Darkness",
      })
    })
  })

  describe("when the user enters a new series & book title", () => {
    it("creates a new series and adds the new book to their items", async () => {
      const user = userEvent.setup()
      const addItem = jest.fn().mockReturnValue("1212")
      render(<AddBookForm />, {
        wrapper: (props) => (
          <Context {...props} overrideMethods={{ addItem }} />
        ),
      })

      await user.type(
        screen.getByRole("textbox", { name: "Book title" }),
        "Gideon the Ninth"
      )
      await user.type(
        screen.getByRole("combobox", { name: "Series name" }),
        "The Locked Tomb"
      )
      await user.click(screen.getByRole("button", { name: "Create" }))

      expect(addItem).toHaveBeenCalledWith(BOOKS_KEY, {
        type: "series",
        name: "The Locked Tomb",
      })
      expect(addItem).toHaveBeenCalledWith(`${BOOKS_KEY}/1212/items`, {
        type: "book",
        title: "Gideon the Ninth",
      })
    })
  })

  describe("when the user selects an existing series & enters a book title", () => {
    it("adds the new book to the existing author", async () => {
      const user = userEvent.setup()
      const addItem = jest.fn().mockReturnValue("1234")
      render(<AddBookForm />, {
        wrapper: (props) => (
          <Context {...props} overrideMethods={{ addItem }} />
        ),
      })

      await user.type(
        screen.getByRole("textbox", { name: "Book title" }),
        "The Tombs of Atuan"
      )
      await user.click(screen.getByRole("option", { name: "Earthsea" }))
      await user.click(screen.getByRole("button", { name: "Create" }))

      expect(addItem).toHaveBeenCalledWith(`${BOOKS_KEY}/3/items`, {
        type: "book",
        title: "The Tombs of Atuan",
      })
    })
  })

  describe("when the user enters a new author, series & book", () => {
    it("adds the new book to the existing author", async () => {
      const user = userEvent.setup()
      const addItem = jest.fn().mockImplementation(getId)
      render(<AddBookForm />, {
        wrapper: (props) => (
          <Context {...props} overrideMethods={{ addItem }} />
        ),
      })

      await user.type(
        screen.getByRole("textbox", { name: "Book title" }),
        "The Long Dark Teatime of the Soul"
      )
      await user.type(
        screen.getByRole("combobox", { name: "Author name" }),
        "Douglas Adams"
      )
      await user.type(
        screen.getByRole("combobox", { name: "Series name" }),
        "Dirk Gently"
      )
      await user.click(screen.getByRole("button", { name: "Create" }))

      expect(addItem).toHaveBeenCalledWith(BOOKS_KEY, {
        type: "author",
        name: "Douglas Adams",
      })
      expect(addItem).toHaveBeenCalledWith(`${BOOKS_KEY}/author_id/items`, {
        type: "series",
        name: "Dirk Gently",
      })

      expect(addItem).toHaveBeenCalledWith(
        `${BOOKS_KEY}/author_id/items/series_id/items`,
        {
          type: "book",
          title: "The Long Dark Teatime of the Soul",
        }
      )
    })
  })

  describe("when the user selects an existing author & enters a new series & book", () => {
    it("adds the new book to the existing author", async () => {
      const user = userEvent.setup()
      const addItem = jest.fn().mockImplementation(getId)
      render(<AddBookForm />, {
        wrapper: (props) => (
          <Context {...props} overrideMethods={{ addItem }} />
        ),
      })

      await user.type(
        screen.getByRole("textbox", { name: "Book title" }),
        "Diggers"
      )
      await user.type(
        screen.getByRole("combobox", { name: "Author name" }),
        "Terry Pratchett"
      )
      await user.type(
        screen.getByRole("combobox", { name: "Series name" }),
        "The Carpet People"
      )
      await user.click(screen.getByRole("button", { name: "Create" }))

      expect(addItem).toHaveBeenCalledWith(`${BOOKS_KEY}/1/items`, {
        type: "series",
        name: "The Carpet People",
      })

      expect(addItem).toHaveBeenCalledWith(
        `${BOOKS_KEY}/1/items/series_id/items`,
        {
          type: "book",
          title: "Diggers",
        }
      )
    })
  })

  describe("when the user selects an existing author & series & enters a new book", () => {
    it("adds the new book to the existing author & series", async () => {
      const user = userEvent.setup()
      const addItem = jest.fn().mockImplementation(getId)
      render(<AddBookForm />, {
        wrapper: (props) => (
          <Context {...props} overrideMethods={{ addItem }} />
        ),
      })

      await user.type(
        screen.getByRole("textbox", { name: "Book title" }),
        "Witches Abroad"
      )
      await user.type(
        screen.getByRole("combobox", { name: "Author name" }),
        "Terry Pratchett"
      )
      await user.type(
        screen.getByRole("combobox", { name: "Series name" }),
        "Discworld"
      )
      await user.click(screen.getByRole("button", { name: "Create" }))

      expect(addItem).toHaveBeenCalledWith(`${BOOKS_KEY}/1/items/4/items`, {
        type: "book",
        title: "Witches Abroad",
      })
    })

    it("only shows the series for the selected author", async () => {
      const user = userEvent.setup()
      const addItem = jest.fn().mockImplementation(getId)
      render(<AddBookForm />, {
        wrapper: (props) => (
          <Context {...props} overrideMethods={{ addItem }} />
        ),
      })

      await user.type(
        screen.getByRole("textbox", { name: "Book title" }),
        "Witches Abroad"
      )
      await user.type(
        screen.getByRole("combobox", { name: "Author name" }),
        "Terry Pratchett"
      )

      expect(
        screen.getByRole("option", { name: "Discworld" })
      ).toBeInTheDocument()
      expect(
        screen.queryByRole("option", { name: "Earthsea" })
      ).not.toBeInTheDocument()
    })
  })

  describe("After the form is submitted", () => {
    it("clears the form", async () => {
      const user = userEvent.setup()
      const addItem = jest.fn().mockImplementation(getId)
      render(<AddBookForm />, {
        wrapper: (props) => (
          <Context {...props} overrideMethods={{ addItem }} />
        ),
      })

      await user.type(
        screen.getByRole("textbox", { name: "Book title" }),
        "Witches Abroad"
      )
      await user.type(
        screen.getByRole("combobox", { name: "Author name" }),
        "Terry Pratchett"
      )
      await user.type(
        screen.getByRole("combobox", { name: "Series name" }),
        "Discworld"
      )
      await user.click(screen.getByRole("button", { name: "Create" }))

      screen.getAllByRole("textbox").forEach((input) => {
        expect(input).toHaveValue("")
      })

      // Just the li element, not the value div
      expect(screen.getAllByText("Terry Pratchett")).toHaveLength(1)

      // The Discworld option doens't appear at all, as the author isn't selected
      expect(screen.queryByText("Discworld")).not.toBeInTheDocument()
    })
  })
})
