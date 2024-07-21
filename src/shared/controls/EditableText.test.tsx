import { act, render, screen } from "@testing-library/react"
import { EditableText } from "./EditableText"
import userEvent from "@testing-library/user-event"

const TEXT = "Buy fabric"

const defaultProps = {
  onChange: jest.fn(),
  children: TEXT,
}

describe("EditableLabel", () => {
  it("renders plain text", () => {
    render(<EditableText {...defaultProps} />)

    expect(getText(TEXT)).toBeInTheDocument()
    expect(queryInput()).not.toBeInTheDocument()
  })

  describe("when the element gains focus", () => {
    it("renders an input", async () => {
      render(<EditableText {...defaultProps} />)

      act(() => {
        getText(TEXT).focus()
      })

      const input = getInput()
      expect(input).toBeInTheDocument()
      expect(input).toHaveValue(TEXT)
      expect(queryText(TEXT)).not.toBeInTheDocument()
    })
  })

  describe("when the element loses focus", () => {
    describe("when the description has not changed", () => {
      it("renders plain text and does not call onChange", async () => {
        const onChange = jest.fn()
        const { container } = render(
          <EditableText {...defaultProps} onChange={onChange} />
        )

        await userEvent.click(getText(TEXT))
        await userEvent.click(container)

        expect(getText(TEXT)).toBeInTheDocument()
        expect(queryInput()).not.toBeInTheDocument()
        expect(onChange).not.toHaveBeenCalled()
      })
    })

    describe("when the description has changed", () => {
      it("renders plain text and calls onUpdate", async () => {
        const onChange = jest.fn()
        const { container } = render(
          <EditableText {...defaultProps} onChange={onChange} />
        )

        await userEvent.click(getText(TEXT))
        const input = getInput()
        await userEvent.clear(input)
        await userEvent.type(input, "Buy pattern")
        await userEvent.click(container)

        expect(screen.getByText(TEXT)).toBeInTheDocument()
        expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
        expect(onChange).toHaveBeenCalledWith("Buy pattern")
      })
    })
  })

  describe("when the user presses enter", () => {
    describe("when the description has not changed", () => {
      it("renders plain text and does not call onUpdate", async () => {
        const onChange = jest.fn()
        render(<EditableText {...defaultProps} onChange={onChange} />)

        await userEvent.click(getText(TEXT))
        await userEvent.type(getInput(), "{Enter}")

        expect(getText(TEXT)).toBeInTheDocument()
        expect(queryInput()).not.toBeInTheDocument()
        expect(onChange).not.toHaveBeenCalled()
      })
    })

    describe("when the description has changed", () => {
      it("renders plain text and calls onUpdate", async () => {
        const onChange = jest.fn()
        render(<EditableText {...defaultProps} onChange={onChange} />)

        await userEvent.click(getText(TEXT))
        const input = getInput()
        await userEvent.clear(input)
        await userEvent.type(input, "Buy pattern")
        await userEvent.keyboard("{Enter}")

        expect(screen.getByText(TEXT)).toBeInTheDocument()
        expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
        expect(onChange).toHaveBeenCalledWith("Buy pattern")
      })
    })
  })
})

const getText = (content: string) => screen.getByText(content)
const queryText = (content: string) => screen.queryByText(content)
const getInput = () => screen.getByRole("textbox")
const queryInput = () => screen.queryByRole("textbox")
