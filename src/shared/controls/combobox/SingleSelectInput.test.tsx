import { render, screen } from "@testing-library/react"
import { SingleSelectValue, SingleSelectValueProps } from "./SingleSelectInput"

const commonProps: SingleSelectValueProps<{ text: string }> = {
  label: "test_label",
  value: { text: "Learning" },
  inputValue: "",
  onChangeInputValue: jest.fn(),
  onKeyDown: jest.fn(),
  popoutId: "popout_id",
  isPopoutOpen: false,
  onFocus: jest.fn(),
}

describe("SingleSelectInput", () => {
  describe("when the popout is open", () => {
    it("hides the selected option", () => {
      render(<SingleSelectValue {...commonProps} isPopoutOpen />)

      expect(screen.queryByText("Learning")).not.toBeInTheDocument()
    })
  })
  describe("when the popout is closed", () => {
    it("shows the selected option", () => {
      render(<SingleSelectValue {...commonProps} isPopoutOpen={false} />)

      expect(screen.getByText("Learning")).toBeInTheDocument()
    })
  })
})
