import { render, screen } from "@testing-library/react"
import { EditableText } from "./EditableText"
import userEvent from "@testing-library/user-event"
import { useState } from "react"

describe("EditableText", () => {
  it("displays its value", () => {
    render(<EditableText value="Do the washing" onChange={jest.fn()} />)

    expect(screen.getByText("Do the washing")).toBeInTheDocument()
  })

  describe("on click", () => {
    it("switches to edit mode", async () => {
      render(<EditableText value="Do the washing" onChange={jest.fn()} />)

      await switchToEditMode("Do the washing")

      const input = screen.getByRole("textbox")
      expect(input).toBeInTheDocument()
      expect(input).toHaveValue("Do the washing")
    })
  })

  describe("when in edit mode", () => {
    describe("when the user presses enter", () => {
      it("exits edit mode", async () => {
        render(<TestComponent />)

        await switchToEditMode("DO the washing")
        await enterText("Do the washing")
        await userEvent.keyboard("{Enter}")

        expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
        expect(screen.getByText("Do the washing")).toBeInTheDocument()
      })
    })

    describe("when the user clicks outside the element", () => {
      it("exits edit mode", async () => {
        const { container } = render(<TestComponent />)

        await switchToEditMode("DO the washing")
        await enterText("Do the washing")
        await userEvent.click(container)

        expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
        expect(screen.getByText("Do the washing")).toBeInTheDocument()
      })
    })
  })
})

function switchToEditMode(text: string) {
  const element = screen.getByText(text)
  return userEvent.click(element)
}

async function enterText(text: string) {
  const input = screen.getByRole("textbox")
  await userEvent.clear(input)
  return userEvent.type(input, text)
}

function TestComponent() {
  const [text, setText] = useState("DO the washing")

  return <EditableText value={text} onChange={setText} />
}
