import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { EditGameForm } from "./EditGameForm"
import { GameDetails, SeriesDetails } from "../types"
import { renderWithMediaStorage } from "../mediaStorageTestUtils"

const botw: GameDetails = {
  id: "game-botw",
  type: "game",
  title: "Breath of the Wild",
}

const zelda: SeriesDetails<GameDetails> = {
  id: "series-zelda",
  type: "series",
  name: "The Legend of Zelda",
  items: { [botw.id]: botw },
}

const metroid: SeriesDetails<GameDetails> = {
  id: "series-metroid",
  type: "series",
  name: "Metroid",
  items: {
    "game-prime": { id: "game-prime", type: "game", title: "Metroid Prime" },
  },
}

describe("EditGameForm", () => {
  it("pre-fills the title and series", () => {
    renderWithMediaStorage(
      <EditGameForm game={botw} isOpen={true} onCancel={jest.fn()} />,
      { gameSeries: [zelda, metroid] },
    )

    expect(screen.getByRole("textbox", { name: "Game title" })).toHaveValue(
      "Breath of the Wild",
    )
    expect(
      screen.getByText("The Legend of Zelda", { selector: ".value" }),
    ).toBeInTheDocument()
  })

  it("saves a changed title without touching the series", async () => {
    const user = userEvent.setup()
    const updateMedia = jest.fn()
    const moveMedia = jest.fn()
    renderWithMediaStorage(
      <EditGameForm game={botw} isOpen={true} onCancel={jest.fn()} />,
      { gameSeries: [zelda, metroid], updateMedia, moveMedia },
    )

    const title = screen.getByRole("textbox", { name: "Game title" })
    await user.clear(title)
    await user.type(title, "The Legend of Zelda: Breath of the Wild")
    await user.click(screen.getByRole("button", { name: "Save" }))

    expect(updateMedia).toHaveBeenCalledWith({
      ...botw,
      title: "The Legend of Zelda: Breath of the Wild",
    })
    expect(moveMedia).not.toHaveBeenCalled()
  })

  it("moves the game when an existing series is chosen", async () => {
    const user = userEvent.setup()
    const moveMedia = jest.fn()
    renderWithMediaStorage(
      <EditGameForm game={botw} isOpen={true} onCancel={jest.fn()} />,
      { gameSeries: [zelda, metroid], moveMedia },
    )

    await user.type(
      screen.getByRole("combobox", { name: "Series name" }),
      "Metroid",
    )
    await user.click(
      screen.getByRole("option", { name: "Metroid", hidden: true }),
    )
    await user.click(screen.getByRole("button", { name: "Save" }))

    expect(moveMedia).toHaveBeenCalledWith(botw, { id: "series-metroid" })
  })

  it("creates a new series when a new name is entered", async () => {
    const user = userEvent.setup()
    const moveMedia = jest.fn()
    renderWithMediaStorage(
      <EditGameForm game={botw} isOpen={true} onCancel={jest.fn()} />,
      { gameSeries: [zelda, metroid], moveMedia },
    )

    await user.type(
      screen.getByRole("combobox", { name: "Series name" }),
      "Hyrule Warriors",
    )
    await user.click(screen.getByRole("button", { name: "Save" }))

    expect(moveMedia).toHaveBeenCalledWith(botw, { name: "Hyrule Warriors" })
  })

  it("deletes the game", async () => {
    const user = userEvent.setup()
    const deleteMedia = jest.fn()
    renderWithMediaStorage(
      <EditGameForm game={botw} isOpen={true} onCancel={jest.fn()} />,
      { gameSeries: [zelda, metroid], deleteMedia },
    )

    await user.click(screen.getByRole("button", { name: "Delete game" }))

    expect(deleteMedia).toHaveBeenCalledWith(botw)
  })

  it("closes without saving when cancelled", async () => {
    const user = userEvent.setup()
    const updateMedia = jest.fn()
    renderWithMediaStorage(
      <EditGameForm game={botw} isOpen={true} onCancel={jest.fn()} />,
      { gameSeries: [zelda, metroid], updateMedia },
    )

    await user.type(
      screen.getByRole("textbox", { name: "Game title" }),
      " (edit)",
    )
    await user.click(screen.getByRole("button", { name: "Cancel" }))

    expect(updateMedia).not.toHaveBeenCalled()
  })
})
