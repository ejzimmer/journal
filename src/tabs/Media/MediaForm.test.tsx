import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AddMediaForm, EditMediaForm, MediaFormConfig } from "./MediaForm"
import { BookDetails, SeriesDetails } from "./types"
import { renderWithMediaStorage } from "./mediaStorageTestUtils"

function itemConfig(
  overrides: Partial<MediaFormConfig<BookDetails>> = {},
): MediaFormConfig<BookDetails> {
  return {
    typeLabel: "Item",
    seriesList: [],
    buildNew: (title, author) => ({
      type: "book",
      title,
      ...(author && { author }),
    }),
    buildUpdated: (item, title, author) => ({
      ...item,
      title,
      ...(author && { author }),
    }),
    ...overrides,
  }
}

const discworld: SeriesDetails<BookDetails> = {
  id: "series-discworld",
  type: "series",
  name: "Discworld",
  items: {
    "book-guards": { id: "book-guards", type: "book", title: "Guards! Guards!" },
  },
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
    },
  },
}

const seriesList = [discworld, earthsea]

describe("AddMediaForm", () => {
  describe("when the user enters a title & submits the form", () => {
    it("creates a new item", async () => {
      const user = userEvent.setup()
      const addMedia = jest.fn()
      renderWithMediaStorage(
        <AddMediaForm ariaLabel="Add an item" config={itemConfig()} />,
        { addMedia },
      )

      await user.click(screen.getByRole("button", { name: "Add an item" }))
      await user.type(
        screen.getByRole("textbox", { name: "Item title" }),
        "The Linguist Mages{Enter}",
      )

      expect(addMedia).toHaveBeenCalledWith({
        type: "book",
        title: "The Linguist Mages",
      })
    })
  })

  describe("when the user enters a new series & title", () => {
    it("creates a new series and adds the new item to its items", async () => {
      const user = userEvent.setup()
      const addMediaSeries = jest.fn()
      renderWithMediaStorage(
        <AddMediaForm
          ariaLabel="Add an item"
          config={itemConfig({ seriesList })}
        />,
        { addMediaSeries },
      )

      await user.click(screen.getByRole("button", { name: "Add an item" }))
      await user.type(
        screen.getByRole("textbox", { name: "Item title" }),
        "Gideon the Ninth",
      )
      await user.type(
        screen.getByRole("combobox", { name: "Series name" }),
        "The Locked Tomb",
      )
      await user.click(screen.getByRole("button", { name: "Save" }))

      expect(addMediaSeries).toHaveBeenCalledWith(
        "The Locked Tomb",
        { type: "book", title: "Gideon the Ninth" },
        undefined,
      )
    })
  })

  describe("when the user selects an existing series & enters a title", () => {
    it("adds the new item to the existing series", async () => {
      const user = userEvent.setup()
      const addMedia = jest.fn()
      renderWithMediaStorage(
        <AddMediaForm
          ariaLabel="Add an item"
          config={itemConfig({ seriesList })}
        />,
        { addMedia },
      )

      await user.click(screen.getByRole("button", { name: "Add an item" }))
      await user.type(
        screen.getByRole("textbox", { name: "Item title" }),
        "The Farthest Shore",
      )
      await user.click(
        screen.getByRole("option", { name: "Earthsea", hidden: true }),
      )
      await user.click(screen.getByRole("button", { name: "Save" }))

      expect(addMedia).toHaveBeenCalledWith(
        { type: "book", title: "The Farthest Shore" },
        "series-earthsea",
      )
    })
  })

  describe("after the form is submitted", () => {
    it("clears the form", async () => {
      const user = userEvent.setup()
      renderWithMediaStorage(
        <AddMediaForm
          ariaLabel="Add an item"
          config={itemConfig({ seriesList })}
        />,
      )

      await user.click(screen.getByRole("button", { name: "Add an item" }))
      await user.type(
        screen.getByRole("textbox", { name: "Item title" }),
        "Witches Abroad",
      )
      await user.type(
        screen.getByRole("combobox", { name: "Series name" }),
        "Discworld",
      )
      await user.click(screen.getByRole("button", { name: "Save" }))

      await user.click(screen.getByRole("button", { name: "Add an item" }))

      expect(screen.getByRole("textbox", { name: "Item title" })).toHaveValue(
        "",
      )
      // Just the option, not the selected value
      expect(screen.getAllByText("Discworld")).toHaveLength(1)
    })
  })

  describe("the author field", () => {
    it("isn't shown when the config has no author options", async () => {
      const user = userEvent.setup()
      renderWithMediaStorage(
        <AddMediaForm ariaLabel="Add an item" config={itemConfig()} />,
      )

      await user.click(screen.getByRole("button", { name: "Add an item" }))

      expect(
        screen.queryByRole("combobox", { name: "Author name" }),
      ).not.toBeInTheDocument()
    })

    it("creates the item with a new author", async () => {
      const user = userEvent.setup()
      const addMedia = jest.fn()
      renderWithMediaStorage(
        <AddMediaForm
          ariaLabel="Add an item"
          config={itemConfig({
            authorOptions: ["Terry Pratchett", "Ursula Le Guin"],
          })}
        />,
        { addMedia },
      )

      await user.click(screen.getByRole("button", { name: "Add an item" }))
      await user.type(
        screen.getByRole("textbox", { name: "Item title" }),
        "Frankenstein",
      )
      await user.type(
        screen.getByRole("combobox", { name: "Author name" }),
        "Mary Shelley",
      )
      await user.click(screen.getByRole("button", { name: "Save" }))

      expect(addMedia).toHaveBeenCalledWith({
        type: "book",
        title: "Frankenstein",
        author: "Mary Shelley",
      })
    })

    it("creates the item with an existing author", async () => {
      const user = userEvent.setup()
      const addMedia = jest.fn()
      renderWithMediaStorage(
        <AddMediaForm
          ariaLabel="Add an item"
          config={itemConfig({
            authorOptions: ["Terry Pratchett", "Ursula Le Guin"],
          })}
        />,
        { addMedia },
      )

      await user.click(screen.getByRole("button", { name: "Add an item" }))
      await user.type(
        screen.getByRole("textbox", { name: "Item title" }),
        "The Left Hand of Darkness",
      )
      await user.click(
        screen.getByRole("option", { name: "Ursula Le Guin", hidden: true }),
      )
      await user.click(screen.getByRole("button", { name: "Save" }))

      expect(addMedia).toHaveBeenCalledWith({
        type: "book",
        title: "The Left Hand of Darkness",
        author: "Ursula Le Guin",
      })
    })
  })
})

describe("EditMediaForm", () => {
  const guards: BookDetails = {
    id: "book-guards",
    type: "book",
    title: "Guards! Guards!",
  }

  it("pre-fills the title, author and series", () => {
    renderWithMediaStorage(
      <EditMediaForm
        item={{ ...guards, author: "Terry Pratchett" }}
        isOpen={true}
        onCancel={jest.fn()}
        config={itemConfig({
          seriesList,
          authorOptions: ["Terry Pratchett", "Ursula Le Guin"],
          getAuthor: (item) => item.author,
        })}
      />,
    )

    expect(screen.getByRole("textbox", { name: "Item title" })).toHaveValue(
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
      <EditMediaForm
        item={guards}
        isOpen={true}
        onCancel={jest.fn()}
        config={itemConfig({ seriesList })}
      />,
      { updateMedia, moveMedia },
    )

    const title = screen.getByRole("textbox", { name: "Item title" })
    await user.clear(title)
    await user.type(title, "Guards! Guards! (revised)")
    await user.click(screen.getByRole("button", { name: "Save" }))

    expect(updateMedia).toHaveBeenCalledWith({
      ...guards,
      title: "Guards! Guards! (revised)",
    })
    expect(moveMedia).not.toHaveBeenCalled()
  })

  it("moves the item when an existing series is chosen", async () => {
    const user = userEvent.setup()
    const moveMedia = jest.fn()
    renderWithMediaStorage(
      <EditMediaForm
        item={guards}
        isOpen={true}
        onCancel={jest.fn()}
        config={itemConfig({ seriesList })}
      />,
      { moveMedia },
    )

    await user.type(
      screen.getByRole("combobox", { name: "Series name" }),
      "Earthsea",
    )
    await user.click(
      screen.getByRole("option", { name: "Earthsea", hidden: true }),
    )
    await user.click(screen.getByRole("button", { name: "Save" }))

    expect(moveMedia).toHaveBeenCalledWith(guards, { id: "series-earthsea" })
  })

  it("creates a new series when a new name is entered", async () => {
    const user = userEvent.setup()
    const moveMedia = jest.fn()
    renderWithMediaStorage(
      <EditMediaForm
        item={guards}
        isOpen={true}
        onCancel={jest.fn()}
        config={itemConfig({ seriesList })}
      />,
      { moveMedia },
    )

    await user.type(
      screen.getByRole("combobox", { name: "Series name" }),
      "The Long Earth",
    )
    await user.click(screen.getByRole("button", { name: "Save" }))

    expect(moveMedia).toHaveBeenCalledWith(guards, { name: "The Long Earth" })
  })

  it("deletes the item", async () => {
    const user = userEvent.setup()
    const deleteMedia = jest.fn()
    renderWithMediaStorage(
      <EditMediaForm
        item={guards}
        isOpen={true}
        onCancel={jest.fn()}
        config={itemConfig({ seriesList })}
      />,
      { deleteMedia },
    )

    await user.click(screen.getByRole("button", { name: "Delete item" }))

    expect(deleteMedia).toHaveBeenCalledWith(guards)
  })

  it("closes without saving when cancelled", async () => {
    const user = userEvent.setup()
    const updateMedia = jest.fn()
    renderWithMediaStorage(
      <EditMediaForm
        item={guards}
        isOpen={true}
        onCancel={jest.fn()}
        config={itemConfig({ seriesList })}
      />,
      { updateMedia },
    )

    await user.type(
      screen.getByRole("textbox", { name: "Item title" }),
      " (edit)",
    )
    await user.click(screen.getByRole("button", { name: "Cancel" }))

    expect(updateMedia).not.toHaveBeenCalled()
  })
})
