import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Labels } from "./Labels"
import { renderWithWorkStorage } from "../workStorageTestUtils"
import { StoredLabel } from "../types"

const a11yLabel: StoredLabel = { id: "id-a11y", value: "a11y", colour: "blue" }

const renderLabels = (props: Partial<Parameters<typeof Labels>[0]> = {}) =>
  renderWithWorkStorage(
    <Labels labelIds={[a11yLabel.id]} onRemoveLabel={jest.fn()} {...props} />,
    { getLabel: (id) => (id === a11yLabel.id ? a11yLabel : undefined) },
  )

describe("Labels", () => {
  it("shows the label as plain text when it isn't editable", () => {
    renderLabels()

    expect(screen.getByText("a11y")).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /Change .* label/ }),
    ).not.toBeInTheDocument()
  })

  it("makes the label text a button when onEditLabel is given", async () => {
    const user = userEvent.setup()
    const onEditLabel = jest.fn()
    renderLabels({ onEditLabel })

    await user.click(screen.getByRole("button", { name: "Change a11y label" }))

    expect(onEditLabel).toHaveBeenCalledWith(a11yLabel.id)
  })
})
