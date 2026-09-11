import { screen } from "@testing-library/react"
import { AddGameForm } from "./AddGameForm"
import userEvent from "@testing-library/user-event"
import { GameDetails, SeriesDetails } from "../types"
import { renderWithMediaStorage } from "../mediaStorageTestUtils"

const zelda: SeriesDetails<GameDetails> = {
  id: "2",
  type: "series",
  name: "The Legend of Zelda",
  items: {
    "3": { id: "3", type: "game", title: "Breath of the Wild" },
  },
}

const gameSeries = [zelda]

const openForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: "Add a game" }))
}

describe("AddGameForm", () => {
  describe("when the user enters a game title & submits the form", () => {
    it("creates a new game", async () => {
      const user = userEvent.setup()
      const addMedia = jest.fn()
      renderWithMediaStorage(<AddGameForm />, { gameSeries, addMedia })

      await openForm(user)
      await user.type(
        screen.getByRole("textbox", { name: "Game title" }),
        "Stardew Valley{Enter}"
      )

      expect(addMedia).toHaveBeenCalledWith({
        type: "game",
        title: "Stardew Valley",
      })
    })
  })

  describe("when the user enters a new series & game title", () => {
    it("creates a new series and adds the new game to its items", async () => {
      const user = userEvent.setup()
      const addMediaSeries = jest.fn()
      renderWithMediaStorage(<AddGameForm />, { gameSeries, addMediaSeries })

      await openForm(user)
      await user.type(
        screen.getByRole("textbox", { name: "Game title" }),
        "Metroid Prime"
      )
      await user.type(
        screen.getByRole("combobox", { name: "Series name" }),
        "Metroid"
      )
      await user.click(screen.getAllByRole("button", { name: "Add a game" })[1])

      expect(addMediaSeries).toHaveBeenCalledWith("Metroid", {
        type: "game",
        title: "Metroid Prime",
      })
    })
  })

  describe("when the user selects an existing series & enters a game title", () => {
    it("adds the new game to the existing series", async () => {
      const user = userEvent.setup()
      const addMedia = jest.fn()
      renderWithMediaStorage(<AddGameForm />, { gameSeries, addMedia })

      await openForm(user)
      await user.type(
        screen.getByRole("textbox", { name: "Game title" }),
        "Breath of the Wild"
      )
      await user.click(
        screen.getByRole("option", { name: "The Legend of Zelda", hidden: true }),
      )
      await user.click(screen.getAllByRole("button", { name: "Add a game" })[1])

      expect(addMedia).toHaveBeenCalledWith(
        { type: "game", title: "Breath of the Wild" },
        "2",
      )
    })
  })

  describe("After the form is submitted", () => {
    it("closes the modal and clears the form", async () => {
      const user = userEvent.setup()
      renderWithMediaStorage(<AddGameForm />, { gameSeries })

      await openForm(user)
      await user.type(
        screen.getByRole("textbox", { name: "Game title" }),
        "Hollow Knight"
      )
      await user.click(screen.getAllByRole("button", { name: "Add a game" })[1])

      expect(
        screen.queryByRole("textbox", { name: "Game title" })
      ).not.toBeInTheDocument()

      await openForm(user)

      expect(screen.getByRole("textbox", { name: "Game title" })).toHaveValue(
        "",
      )
    })
  })
})
