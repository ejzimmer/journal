import { render, screen } from "@testing-library/react"
import { Dropdown, DropdownProps } from "./Dropdown"
import userEvent from "@testing-library/user-event"

type MockOption = {
  text: string
  colour: string
}

const mockOptions: MockOption[] = [
  { text: "a11y", colour: "blue" },
  { text: "i18n", colour: "yellow" },
  { text: "dev prod", colour: "purple" },
  { text: "feature flag", colour: "green" },
  { text: "PR", colour: "orange" },
]

const commonProps: DropdownProps<MockOption> = {
  id: "test_id",
  isPopoutOpen: true,
  options: mockOptions,
  onClick: jest.fn(),
}

// I haven't figured out how to mock the start state of the popover, so render it once,
// then set it to the state we want
describe("Dropdown", () => {
  it("opens the dropdown", () => {
    const { rerender } = render(<Dropdown {...commonProps} />)
    rerender(<Dropdown {...commonProps} isPopoutOpen={false} />)

    expect(screen.getByText("a11y")).not.toBeVisible()

    rerender(<Dropdown {...commonProps} isPopoutOpen={true} />)
    expect(screen.getByText("a11y")).toBeVisible()
  })

  it("submits the clicked option", async () => {
    const user = userEvent.setup()
    const onClick = jest.fn()
    render(<Dropdown {...commonProps} onClick={onClick} />)

    await user.click(screen.getByRole("option", { name: mockOptions[4].text }))

    expect(onClick).toHaveBeenCalledWith(mockOptions[4])
  })

  it("navigates with the arrow keys", async () => {
    const user = userEvent.setup()
    render(<Dropdown {...commonProps} />)

    await user.keyboard("{ArrowDown}{ArrowDown}")

    expect(
      screen.getByRole("option", { name: mockOptions[1].text })
    ).toHaveAttribute("aria-selected", "true")
  })

  describe("when navigating via arrow keys", () => {
    it("submits the highlighted option on space", async () => {
      const user = userEvent.setup()
      const onClick = jest.fn()
      render(<Dropdown {...commonProps} onClick={onClick} />)

      await user.keyboard("{ArrowDown}{ArrowDown} ")

      expect(onClick).toHaveBeenCalledWith(mockOptions[1])
    })

    it("wrap around the bottom and top of the list", async () => {
      const user = userEvent.setup()
      render(<Dropdown {...commonProps} />)

      await user.keyboard("{ArrowUp}")

      expect(
        screen.getByRole("option", { name: mockOptions.at(-1)?.text })
      ).toHaveAttribute("aria-selected", "true")

      await user.keyboard("{ArrowDown}")

      expect(
        screen.getByRole("option", { name: mockOptions[0].text })
      ).toHaveAttribute("aria-selected", "true")
    })
  })

  describe("when nothing has been selected by keyboard", () => {
    it("doesn't call onClick when space is pressed", async () => {
      const user = userEvent.setup()
      const onClick = jest.fn()
      render(<Dropdown {...commonProps} onClick={onClick} />)

      await user.keyboard(" ")

      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe("when an element is already selected", () => {
    it("highlights the selected element", () => {
      render(<Dropdown {...commonProps} selectedOption={mockOptions[2]} />)

      const selectedOption = screen.getByRole("option", {
        name: mockOptions[2].text,
      })
      expect(selectedOption).toHaveAttribute("aria-selected", "true")
    })
  })

  describe("when no element is selected", () => {
    it("resets the highlighted element between renders", async () => {
      const user = userEvent.setup()
      const { rerender } = render(<Dropdown {...commonProps} />)

      const options = screen.getAllByRole("option")
      options.forEach((o) =>
        expect(o).toHaveAttribute("aria-selected", "false")
      )
      await user.keyboard("{ArrowDown}")
      expect(
        screen.getByRole("option", { name: mockOptions[0].text })
      ).toHaveAttribute("aria-selected", "true")

      rerender(<Dropdown {...commonProps} isPopoutOpen={false} />)
      rerender(<Dropdown {...commonProps} isPopoutOpen />)

      options.forEach((o) =>
        expect(o).toHaveAttribute("aria-selected", "false")
      )
    })
  })

  describe("when the list of options changes", () => {
    it("maintains the currently highlighted option if possible", async () => {
      const user = userEvent.setup()
      const { rerender } = render(<Dropdown {...commonProps} />)
      await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}")
      expect(
        screen.getByRole("option", { name: mockOptions[2].text })
      ).toHaveAttribute("aria-selected", "true")

      rerender(
        <Dropdown
          {...commonProps}
          options={mockOptions.filter((_, index) => index % 2 === 0)}
        />
      )

      expect(
        screen.getByRole("option", { name: mockOptions[2].text })
      ).toHaveAttribute("aria-selected", "true")
    })

    describe("and the currently highlighted option is removed", () => {
      it("resets to nothing selected", async () => {
        const user = userEvent.setup()
        const { rerender } = render(<Dropdown {...commonProps} />)
        await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}")
        expect(
          screen.getByRole("option", { name: mockOptions[2].text })
        ).toHaveAttribute("aria-selected", "true")

        rerender(
          <Dropdown
            {...commonProps}
            options={mockOptions.filter((_, index) => index % 2)}
          />
        )

        screen.getAllByRole("option").forEach((o) => {
          expect(o).toHaveAttribute("aria-selected", "false")
        })
      })
    })
  })
})
