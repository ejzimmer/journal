import userEvent from "@testing-library/user-event"
import { MultiSelectInput, MultiSelectInputProps } from "./MultiSelectInput"
import { render, screen } from "@testing-library/react"

const commonProps: MultiSelectInputProps<{ text: string; colour: string }> = {
  label: "Value",
  value: [
    { text: "a11y", colour: "blue" },
    { text: "i18n", colour: "yellow" },
  ],
  onChange: jest.fn(),
  inputValue: "",
  onChangeInputValue: jest.fn(),
  onKeyDown: jest.fn(),
  onFocus: jest.fn(),
  popoutId: "popout_id",
  isPopoutOpen: false,
}

describe("MultiSelectInput", () => {
  describe("when the user clicks clear all", () => {
    it("clears the value", async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(<MultiSelectInput {...commonProps} onChange={onChange} />)

      await user.click(screen.getByRole("button", { name: "Clear all" }))

      expect(onChange).toHaveBeenCalledWith([])
    })
  })

  describe("when the user clicks remove", () => {
    it("clears the value", async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(<MultiSelectInput {...commonProps} onChange={onChange} />)

      await user.click(screen.getByRole("button", { name: "Remove i18n" }))

      expect(onChange).toHaveBeenCalledWith([commonProps.value[0]])
    })
  })
})
