import { screen } from "@testing-library/react"
import { AddBookForm } from "./AddBookForm"
import userEvent from "@testing-library/user-event"
import { BookDetails, SeriesDetails } from "../types"
import { renderWithMediaStorage } from "../mediaStorageTestUtils"

const discworld: SeriesDetails<BookDetails> = {
  id: "2",
  type: "series",
  name: "Discworld",
  items: {
    "3": { id: "3", type: "book", title: "Thud!", author: "Terry Pratchett" },
  },
}

const earthsea: SeriesDetails<BookDetails> = {
  id: "4",
  type: "series",
  name: "Earthsea",
  items: {
    "5": {
      id: "5",
      type: "book",
      title: "The Tombs of Atuan",
      author: "Ursula Le Guin",
    },
  },
}

const authors = ["Terry Pratchett", "Ursula Le Guin"]
const bookSeries = [discworld, earthsea]

const openForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: "Add a book" }))
}

describe("AddBookForm", () => {
  describe("when the user enters a book title & submits the form", () => {
    it("creates a new book", async () => {
      const user = userEvent.setup()
      const addMedia = jest.fn()
      renderWithMediaStorage(<AddBookForm />, { authors, bookSeries, addMedia })

      await openForm(user)
      await user.type(
        screen.getByRole("textbox", { name: "Book title" }),
        "The Linguist Mages{Enter}"
      )

      expect(addMedia).toHaveBeenCalledWith({
        type: "book",
        title: "The Linguist Mages",
      })
    })
  })

  describe("when the user enters a new author & book title", () => {
    it("creates the book with that author", async () => {
      const user = userEvent.setup()
      const addMedia = jest.fn()
      renderWithMediaStorage(<AddBookForm />, { authors, bookSeries, addMedia })

      await openForm(user)
      await user.type(
        screen.getByRole("textbox", { name: "Book title" }),
        "Frankenstein"
      )
      await user.type(
        screen.getByRole("combobox", { name: "Author name" }),
        "Mary Shelley"
      )
      await user.click(screen.getAllByRole("button", { name: "Add a book" })[1])

      expect(addMedia).toHaveBeenCalledWith({
        type: "book",
        title: "Frankenstein",
        author: "Mary Shelley",
      })
    })
  })

  describe("when the user selects an existing author & enters a book title", () => {
    it("creates the book with that author", async () => {
      const user = userEvent.setup()
      const addMedia = jest.fn()
      renderWithMediaStorage(<AddBookForm />, { authors, bookSeries, addMedia })

      await openForm(user)
      await user.type(
        screen.getByRole("textbox", { name: "Book title" }),
        "The Left Hand of Darkness"
      )
      await user.click(
        screen.getByRole("option", { name: "Ursula Le Guin", hidden: true }),
      )
      await user.click(screen.getAllByRole("button", { name: "Add a book" })[1])

      expect(addMedia).toHaveBeenCalledWith({
        type: "book",
        title: "The Left Hand of Darkness",
        author: "Ursula Le Guin",
      })
    })
  })

  describe("the author options", () => {
    it("include the authors of books in a series", async () => {
      const user = userEvent.setup()
      renderWithMediaStorage(<AddBookForm />, { authors, bookSeries })

      await openForm(user)

      expect(
        screen.getByRole("option", { name: "Terry Pratchett", hidden: true })
      ).toBeInTheDocument()
      expect(
        screen.getByRole("option", { name: "Ursula Le Guin", hidden: true })
      ).toBeInTheDocument()
    })

    it("list each author once", async () => {
      const user = userEvent.setup()
      renderWithMediaStorage(<AddBookForm />, { authors, bookSeries })

      await openForm(user)

      expect(
        screen.getAllByRole("option", { name: "Terry Pratchett", hidden: true })
      ).toHaveLength(1)
    })
  })

  describe("when the user enters a new series & book title", () => {
    it("creates a new series and adds the new book to its items", async () => {
      const user = userEvent.setup()
      const addMediaSeries = jest.fn()
      renderWithMediaStorage(<AddBookForm />, {
        authors,
        bookSeries,
        addMediaSeries,
      })

      await openForm(user)
      await user.type(
        screen.getByRole("textbox", { name: "Book title" }),
        "Gideon the Ninth"
      )
      await user.type(
        screen.getByRole("combobox", { name: "Series name" }),
        "The Locked Tomb"
      )
      await user.click(screen.getAllByRole("button", { name: "Add a book" })[1])

      expect(addMediaSeries).toHaveBeenCalledWith("The Locked Tomb", {
        type: "book",
        title: "Gideon the Ninth",
      })
    })
  })

  describe("when the user selects an existing series & enters a book title", () => {
    it("adds the new book to the existing series", async () => {
      const user = userEvent.setup()
      const addMedia = jest.fn()
      renderWithMediaStorage(<AddBookForm />, { authors, bookSeries, addMedia })

      await openForm(user)
      await user.type(
        screen.getByRole("textbox", { name: "Book title" }),
        "The Farthest Shore"
      )
      await user.click(
        screen.getByRole("option", { name: "Earthsea", hidden: true }),
      )
      await user.click(screen.getAllByRole("button", { name: "Add a book" })[1])

      expect(addMedia).toHaveBeenCalledWith(
        { type: "book", title: "The Farthest Shore" },
        "4",
      )
    })
  })

  describe("when the user enters an author, a series & a book", () => {
    it("adds the book to the series, with its author", async () => {
      const user = userEvent.setup()
      const addMediaSeries = jest.fn()
      renderWithMediaStorage(<AddBookForm />, {
        authors,
        bookSeries,
        addMediaSeries,
      })

      await openForm(user)
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
      await user.click(screen.getAllByRole("button", { name: "Add a book" })[1])

      expect(addMediaSeries).toHaveBeenCalledWith("Dirk Gently", {
        type: "book",
        title: "The Long Dark Teatime of the Soul",
        author: "Douglas Adams",
      })
    })
  })

  describe("After the form is submitted", () => {
    it("closes the modal and clears the form", async () => {
      const user = userEvent.setup()
      renderWithMediaStorage(<AddBookForm />, { authors, bookSeries })

      await openForm(user)
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
      await user.click(screen.getAllByRole("button", { name: "Add a book" })[1])

      expect(
        screen.queryByRole("textbox", { name: "Book title" })
      ).not.toBeInTheDocument()

      await openForm(user)

      expect(screen.getByRole("textbox", { name: "Book title" })).toHaveValue(
        "",
      )
      // Just the option, not the selected value
      expect(screen.getAllByText("Terry Pratchett")).toHaveLength(1)
      expect(screen.getAllByText("Discworld")).toHaveLength(1)
    })
  })
})
