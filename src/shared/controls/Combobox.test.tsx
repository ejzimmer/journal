import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Combobox } from "./Combobox"

HTMLElement.prototype.showPopover = jest.fn()

const options = {
  leela: {
    id: "leela",
    label: "Leela",
    colour: "purple",
  },
  bender: {
    id: "bender",
    label: "Bender",
    colour: "silver",
  },
  fry: {
    id: "fry",
    label: "Fry",
    colour: "orange",
  },
  zoidberg: {
    id: "zoidberg",
    label: "Zoidberg",
    colour: "salmon",
  },
}

const defaultProps = {
  options: Object.values(options),
  value: [],
  createOption: (label: string) => ({
    id: label.toLowerCase(),
    label,
    colour: "pink",
  }),
  onAddOption: jest.fn(),
  onChange: jest.fn(),
}

describe("Combobox", () => {
  it("display the selected options", async () => {
    const user = userEvent.setup()
    const selectedOptions = [options.leela, options.zoidberg]
    render(<Combobox {...defaultProps} value={selectedOptions} />)

    selectedOptions.forEach((option) => {
      expect(
        screen.getByRole("button", {
          name: `${option.label}, remove`,
        })
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole("textbox"))

    selectedOptions.forEach((option) => {
      expect(
        screen.getByRole("option", { name: option.label })
      ).toHaveAttribute("aria-selected", "true")
    })
    ;[options.fry, options.bender].forEach((option) => {
      expect(
        screen.getByRole("option", { name: option.label })
      ).toHaveAttribute("aria-selected", "false")
    })
  })

  describe("mouse interactions", () => {
    it("selects an option from the list", async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(<Combobox {...defaultProps} onChange={onChange} />)

      await user.click(screen.getByRole("textbox"))
      const benderOption = screen.getByRole("option", { name: "Bender" })
      await user.click(benderOption)

      expect(onChange).toHaveBeenCalledWith([options.bender])
    })

    it("removes an option", async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      const selectedOptions = [options.fry, options.zoidberg, options.leela]
      render(
        <Combobox
          {...defaultProps}
          onChange={onChange}
          value={selectedOptions}
        />
      )

      await user.click(screen.getByRole("button", { name: "Zoidberg, remove" }))

      expect(onChange).toHaveBeenCalledWith([options.fry, options.leela])
    })
  })

  describe("keyboard interactions", () => {
    it("selects an option from the list", async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(<Combobox {...defaultProps} onChange={onChange} />)

      await user.keyboard("{Tab}")

      await user.keyboard("{ArrowDown}{ArrowDown}")
      await user.keyboard(" ")

      expect(onChange).toHaveBeenCalledWith([options.bender])
    })

    it("removes an option", async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      const selectedOptions = [options.fry, options.zoidberg, options.leela]
      render(
        <Combobox
          {...defaultProps}
          onChange={onChange}
          value={selectedOptions}
        />
      )

      await user.keyboard("{Tab}")
      await user.keyboard("{ArrowRight}{ArrowRight}")
      await user.keyboard("{Enter}")
      expect(onChange).toHaveBeenCalledWith([options.fry, options.leela])

      await user.keyboard("{Space}")
      expect(onChange).toHaveBeenCalledWith([options.fry, options.leela])

      await user.keyboard("{Backspace}")
      expect(onChange).toHaveBeenCalledWith([options.fry, options.leela])
    })

    it("wraps around the list when navigating via arrows", async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(<Combobox {...defaultProps} onChange={onChange} />)

      const lastOption = defaultProps.options.at(-1)
      const firstOption = defaultProps.options.at(0)

      await user.keyboard("{Tab}")

      await user.keyboard("{ArrowUp} ")
      expect(onChange).toHaveBeenCalledWith([lastOption])

      await user.keyboard("{ArrowDown} ")
      expect(onChange).toHaveBeenCalledWith([firstOption])

      await user.keyboard("{ArrowUp} ")
      expect(onChange).toHaveBeenCalledWith([lastOption])
    })

    it("wraps around the buttons when navigating via arrows", async () => {
      const user = userEvent.setup()
      const selectedOptions = [options.fry, options.zoidberg, options.leela]
      const onChange = jest.fn()
      render(
        <Combobox
          {...defaultProps}
          onChange={onChange}
          value={selectedOptions}
        />
      )

      await user.keyboard("{Tab}")

      await user.keyboard("{ArrowLeft} ")
      expect(onChange).toHaveBeenCalledWith([options.fry, options.zoidberg])

      await user.keyboard("{ArrowLeft} ")
      expect(onChange).toHaveBeenCalledWith([options.fry, options.leela])

      await user.keyboard("{ArrowRight}{ArrowRight} ")
      expect(onChange).toHaveBeenCalledWith([options.zoidberg, options.leela])
    })
  })

  describe("when the user types in the input", () => {
    it("filters the list of options", async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(<Combobox {...defaultProps} onChange={onChange} />)

      const zoidbergOption = screen.getByRole("option", { name: "Zoidberg" })

      await user.keyboard("{Tab}") // move focus to input
      await user.keyboard("be")

      expect(screen.getByRole("option", { name: "Bender" })).toBeInTheDocument()
      expect(zoidbergOption).toBeInTheDocument()
      expect(
        screen.queryByRole("option", { name: "Fry" })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole("option", { name: "Leela" })
      ).not.toBeInTheDocument()

      await user.keyboard("{ArrowDown}{ArrowDown} ")
      expect(onChange).toHaveBeenCalledWith([options.zoidberg])
    })

    it("creates a new option based on what the user typed", async () => {
      const user = userEvent.setup()
      const onAddOption = jest.fn()
      render(<Combobox {...defaultProps} onAddOption={onAddOption} />)

      await user.keyboard("{Tab}") // move focus to input
      await user.keyboard("A")

      expect(screen.getByRole("option", { name: "Leela" })).toBeInTheDocument()
      expect(screen.getByRole("option", { name: "A" })).toBeInTheDocument()

      await user.keyboard("my{ArrowDown} ")

      expect(onAddOption).toHaveBeenCalledWith({
        id: "amy",
        label: "Amy",
        colour: "pink",
      })
      expect(screen.getByRole("textbox")).toHaveValue("")
    })
  })
  // can handle arbitrary options & selected lozenges
  // remove an option via keyboard - use left/right arrow keys to navigate between options?
})
