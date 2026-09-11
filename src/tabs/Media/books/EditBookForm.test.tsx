import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { EditBookForm } from "./EditBookForm"
import { BookDetails, SeriesDetails } from "../types"
import { renderWithMediaStorage } from "../mediaStorageTestUtils"

const guards: BookDetails = {
  id: "book-guards",
  type: "book",
  title: "Guards! Guards!",
  author: "Terry Pratchett",
}

const discworld: SeriesDetails<BookDetails> = {
  id: "series-discworld",
  type: "series",
  name: "Discworld",
  items: { [guards.id]: guards },
}

const earthsea: SeriesDetails<BookDetails> = {
  id: "series-earthsea",
  type: "series",
  name: "Earthsea",
  items: {
    "book-wizard": {
      id: "book-wizard",
      type: "book",
      title: "A Wizard of Earthsea",
      author: "Ursula Le Guin",
    },
  },
}

const authors = ["Terry Pratchett", "Ursula Le Guin"]

describe("EditBookForm", () => {
  it("pre-fills the title, author and series", () => {
    renderWithMediaStorage(
      <EditBookForm book={guards} isOpen={true} onCancel={jest.fn()} />,
      { authors, bookSeries: [discworld, earthsea] },
    )

    expect(screen.getByRole("textbox", { name: "Book title" })).toHaveValue(
      "Guards! Guards!",
    )
    expect(
      screen.getByText("Terry Pratchett", { selector: ".value" }),
    ).toBeInTheDocument()
    expect(
      screen.getByText("Discworld", { selector: ".value" }),
    ).toBeInTheDocument()
  })

  it("saves a changed title without touching the series", async () => {
    const user = userEvent.setup()
    const updateMedia = jest.fn()
    const moveMedia = jest.fn()
    renderWithMediaStorage(
      <EditBookForm book={guards} isOpen={true} onCancel={jest.fn()} />,
      {
        authors,
        bookSeries: [discworld, earthsea],
        updateMedia,
        moveMedia,
      },
    )

    const title = screen.getByRole("textbox", { name: "Book title" })
    await user.clear(title)
    await user.type(title, "Guards! Guards! (revised)")
    await user.click(screen.getByRole("button", { name: "Save" }))

    expect(updateMedia).toHaveBeenCalledWith({
      ...guards,
      title: "Guards! Guards! (revised)",
    })
    expect(moveMedia).not.toHaveBeenCalled()
  })

  it("moves the book when an existing series is chosen", async () => {
    const user = userEvent.setup()
    const moveMedia = jest.fn()
    renderWithMediaStorage(
      <EditBookForm book={guards} isOpen={true} onCancel={jest.fn()} />,
      { authors, bookSeries: [discworld, earthsea], moveMedia },
    )

    await user.type(
      screen.getByRole("combobox", { name: "Series name" }),
      "Earthsea",
    )
    await user.click(
      screen.getByRole("option", { name: "Earthsea", hidden: true }),
    )
    await user.click(screen.getByRole("button", { name: "Save" }))

    expect(moveMedia).toHaveBeenCalledWith(guards, "series-earthsea")
  })

  it("creates a new series when a new name is entered", async () => {
    const user = userEvent.setup()
    const moveMediaToNewSeries = jest.fn()
    renderWithMediaStorage(
      <EditBookForm book={guards} isOpen={true} onCancel={jest.fn()} />,
      { authors, bookSeries: [discworld, earthsea], moveMediaToNewSeries },
    )

    await user.type(
      screen.getByRole("combobox", { name: "Series name" }),
      "The Long Earth",
    )
    await user.click(screen.getByRole("button", { name: "Save" }))

    expect(moveMediaToNewSeries).toHaveBeenCalledWith(guards, "The Long Earth")
  })

  it("deletes the book", async () => {
    const user = userEvent.setup()
    const deleteMedia = jest.fn()
    renderWithMediaStorage(
      <EditBookForm book={guards} isOpen={true} onCancel={jest.fn()} />,
      { authors, bookSeries: [discworld, earthsea], deleteMedia },
    )

    await user.click(screen.getByRole("button", { name: "Delete book" }))

    expect(deleteMedia).toHaveBeenCalledWith(guards)
  })

  it("closes without saving when cancelled", async () => {
    const user = userEvent.setup()
    const updateMedia = jest.fn()
    renderWithMediaStorage(
      <EditBookForm book={guards} isOpen={true} onCancel={jest.fn()} />,
      { authors, bookSeries: [discworld, earthsea], updateMedia },
    )

    await user.type(
      screen.getByRole("textbox", { name: "Book title" }),
      " (edit)",
    )
    await user.click(screen.getByRole("button", { name: "Cancel" }))

    expect(updateMedia).not.toHaveBeenCalled()
  })
})
