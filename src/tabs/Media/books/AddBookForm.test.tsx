import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AddBookForm } from "./AddBookForm"
import { ListParent, MediaList } from "../types"
import { renderWithMediaStorage } from "../mediaStorageTestUtils"

const pratchett: ListParent = { id: "pratchett", name: "Terry Pratchett" }
const leguin: ListParent = { id: "leguin", name: "Ursula Le Guin" }
const discworld: ListParent = { id: "discworld", name: "Discworld" }
const earthsea: ListParent = { id: "earthsea", name: "Earthsea" }

const seriesIn = ({ author }: MediaList) => {
  if (!author) return [earthsea]
  return author.id === pratchett.id ? [discworld] : []
}

const renderAddBookForm = () =>
  renderWithMediaStorage(<AddBookForm />, {
    authors: [pratchett, leguin],
    seriesIn,
  })

describe("AddBookForm", () => {
  describe("when only a title is entered", () => {
    it("adds the book to the root list", async () => {
      const user = userEvent.setup()
      const { storage } = renderAddBookForm()

      await user.type(
        screen.getByRole("textbox", { name: "Book title" }),
        "The Linguist Mages{Enter}",
      )

      expect(storage.addToList).toHaveBeenCalledWith(
        { root: "books", author: undefined, series: undefined },
        { type: "book", title: "The Linguist Mages" },
      )
    })
  })

  describe("when an existing author is chosen", () => {
    it("adds the book to that author's list", async () => {
      const user = userEvent.setup()
      const { storage } = renderAddBookForm()

      await user.type(
        screen.getByRole("textbox", { name: "Book title" }),
        "The Left Hand of Darkness",
      )
      await user.click(
        screen.getByRole("option", { name: "Ursula Le Guin", hidden: true }),
      )
      await user.click(screen.getByRole("button", { name: "Create" }))

      expect(storage.addToList).toHaveBeenCalledWith(
        { root: "books", author: leguin, series: undefined },
        { type: "book", title: "The Left Hand of Darkness" },
      )
    })
  })

  describe("when an author and series that don't exist yet are entered", () => {
    it("names them in the list with no ids, for storage to create", async () => {
      const user = userEvent.setup()
      const { storage } = renderAddBookForm()

      await user.type(
        screen.getByRole("textbox", { name: "Book title" }),
        "The Long Dark Teatime of the Soul",
      )
      await user.type(
        screen.getByRole("combobox", { name: "Author name" }),
        "Douglas Adams",
      )
      await user.type(
        screen.getByRole("combobox", { name: "Series name" }),
        "Dirk Gently",
      )
      await user.click(screen.getByRole("button", { name: "Create" }))

      expect(storage.addToList).toHaveBeenCalledWith(
        {
          root: "books",
          author: { id: "", name: "Douglas Adams" },
          series: { id: "", name: "Dirk Gently" },
        },
        { type: "book", title: "The Long Dark Teatime of the Soul" },
      )
    })
  })

  describe("when an author is chosen", () => {
    it("only offers that author's series", async () => {
      const user = userEvent.setup()
      renderAddBookForm()

      await user.type(
        screen.getByRole("combobox", { name: "Author name" }),
        "Terry Pratchett",
      )

      expect(
        screen.getByRole("option", { name: "Discworld", hidden: true }),
      ).toBeInTheDocument()
      expect(
        screen.queryByRole("option", { name: "Earthsea", hidden: true }),
      ).not.toBeInTheDocument()
    })
  })

  describe("after the form is submitted", () => {
    it("clears the form", async () => {
      const user = userEvent.setup()
      renderAddBookForm()

      await user.type(
        screen.getByRole("textbox", { name: "Book title" }),
        "Witches Abroad",
      )
      await user.click(
        screen.getByRole("option", { name: "Terry Pratchett", hidden: true }),
      )
      await user.click(screen.getByRole("button", { name: "Create" }))

      screen.getAllByRole("textbox").forEach((input) => {
        expect(input).toHaveValue("")
      })
      expect(screen.getAllByText("Terry Pratchett")).toHaveLength(1)
      expect(screen.queryByText("Discworld")).not.toBeInTheDocument()
    })
  })
})
