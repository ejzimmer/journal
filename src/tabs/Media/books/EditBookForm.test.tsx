import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { EditBookForm } from "./EditBookForm"
import { BookDetails, ListParent, MediaList } from "../types"
import { MediaStorageContextType } from "../MediaStorageContext"
import { renderWithMediaStorage } from "../mediaStorageTestUtils"

const pratchett: ListParent = { id: "pratchett", name: "Terry Pratchett" }
const leguin: ListParent = { id: "leguin", name: "Ursula Le Guin" }
const discworld: ListParent = { id: "discworld", name: "Discworld" }
const earthsea: ListParent = { id: "earthsea", name: "Earthsea" }

const nightWatch: BookDetails = {
  id: "night-watch",
  type: "book",
  title: "Night Watch",
  medium: "🎧",
}

const inDiscworld: MediaList = {
  root: "books",
  author: pratchett,
  series: discworld,
}

const seriesIn = ({ author }: MediaList) => {
  if (!author) return [earthsea]
  return author.id === pratchett.id ? [discworld] : []
}

const renderForm = (
  book: BookDetails,
  list: MediaList,
  overrides: Partial<MediaStorageContextType> = {},
) =>
  renderWithMediaStorage(<EditBookForm book={book} list={list} />, {
    authors: [pratchett, leguin],
    seriesIn,
    ...overrides,
  })

const openForm = async (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole("button", { name: /^Night Watch|^The Linguist/ }))

const save = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole("button", { name: "Save" }))

const orphan: BookDetails = {
  id: "orphan",
  type: "book",
  title: "The Linguist Mages",
}

describe("EditBookForm", () => {
  describe("when the form is opened", () => {
    it("fills it in from the book and the list it is in", async () => {
      const user = userEvent.setup()
      renderForm(nightWatch, inDiscworld)

      await openForm(user)

      expect(screen.getByRole("textbox", { name: "Title" })).toHaveValue(
        "Night Watch",
      )
      expect(screen.getByRole("radio", { name: "Listening" })).toBeChecked()
      expect(
        screen.getByRole("option", { name: "Terry Pratchett", hidden: true }),
      ).toHaveAttribute("aria-selected", "true")
      expect(
        screen.getByRole("option", { name: "Discworld", hidden: true }),
      ).toHaveAttribute("aria-selected", "true")
    })
  })

  describe("when the title and status are changed", () => {
    it("moves the book to the list it is already in, which updates it in place", async () => {
      const user = userEvent.setup()
      const { storage } = renderForm(nightWatch, inDiscworld)

      await openForm(user)
      await user.clear(screen.getByRole("textbox", { name: "Title" }))
      await user.type(
        screen.getByRole("textbox", { name: "Title" }),
        "Night Watch (annotated)",
      )
      await user.click(screen.getByRole("radio", { name: "Reading" }))
      await save(user)

      expect(storage.moveToList).toHaveBeenCalledWith(
        {
          ...nightWatch,
          title: "Night Watch (annotated)",
          medium: "📖",
          isDone: false,
        },
        inDiscworld,
        { root: "books", author: pratchett, series: discworld },
      )
    })
  })

  describe("when the book is marked as read", () => {
    it("clears the medium", async () => {
      const user = userEvent.setup()
      const { storage } = renderForm(nightWatch, inDiscworld)

      await openForm(user)
      await user.click(screen.getByRole("radio", { name: "Read" }))
      await save(user)

      expect(storage.moveToList).toHaveBeenCalledWith(
        expect.objectContaining({ isDone: true, medium: null }),
        expect.anything(),
        expect.anything(),
      )
    })
  })

  describe("when a book with no author is given one", () => {
    it("moves it to that author's list", async () => {
      const user = userEvent.setup()
      const { storage } = renderForm(orphan, { root: "books" })

      await openForm(user)
      await user.click(
        screen.getByRole("option", { name: "Ursula Le Guin", hidden: true }),
      )
      await save(user)

      expect(storage.moveToList).toHaveBeenCalledWith(
        expect.objectContaining({ id: "orphan" }),
        { root: "books" },
        { root: "books", author: leguin, series: undefined },
      )
    })
  })

  describe("when a book is given a series that doesn't exist yet", () => {
    it("moves it to a list naming the series, with no id for it", async () => {
      const user = userEvent.setup()
      const { storage } = renderForm(nightWatch, inDiscworld)

      await openForm(user)
      await user.type(
        screen.getByRole("combobox", { name: "Series" }),
        "The Watch",
      )
      await save(user)

      expect(storage.moveToList).toHaveBeenCalledWith(
        expect.anything(),
        inDiscworld,
        {
          root: "books",
          author: pratchett,
          series: { id: "", name: "The Watch" },
        },
      )
    })
  })

  describe("when an author is chosen", () => {
    it("only offers that author's series", async () => {
      const user = userEvent.setup()
      renderForm(orphan, { root: "books" })

      await openForm(user)
      expect(
        screen.getByRole("option", { name: "Earthsea", hidden: true }),
      ).toBeInTheDocument()

      await user.click(
        screen.getByRole("option", { name: "Terry Pratchett", hidden: true }),
      )

      expect(
        screen.getByRole("option", { name: "Discworld", hidden: true }),
      ).toBeInTheDocument()
      expect(
        screen.queryByRole("option", { name: "Earthsea", hidden: true }),
      ).not.toBeInTheDocument()
    })
  })

  describe("when the title is cleared", () => {
    it("removes the book from its list", async () => {
      const user = userEvent.setup()
      const { storage } = renderForm(nightWatch, inDiscworld)

      await openForm(user)
      await user.clear(screen.getByRole("textbox", { name: "Title" }))
      await save(user)

      expect(storage.removeFromList).toHaveBeenCalledWith(
        inDiscworld,
        nightWatch,
      )
      expect(storage.moveToList).not.toHaveBeenCalled()
    })
  })
})
