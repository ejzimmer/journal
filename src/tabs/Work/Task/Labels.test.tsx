import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Labels } from "./Labels"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { LabelsContext } from "../LabelsContext"
import { Label } from "../types"

const label: Label = { id: "label-1", value: "a11y", colour: "blue" }

function createStorageContext() {
  return {
    addItem: jest.fn(),
    updateItem: jest.fn(),
    deleteItem: jest.fn(),
    updateList: jest.fn(),
    useValue: () => ({ value: undefined, loading: false }),
  }
}

function renderLabels(storageContext: ReturnType<typeof createStorageContext>, onRemoveLabel = jest.fn()) {
  return render(
    <FirebaseContext.Provider value={storageContext}>
      <LabelsContext.Provider value={[label]}>
        <Labels labelIds={[label.id]} onRemoveLabel={onRemoveLabel} />
      </LabelsContext.Provider>
    </FirebaseContext.Provider>,
  )
}

describe("Labels", () => {
  it("renders the label text", () => {
    renderLabels(createStorageContext())

    expect(screen.getByText("a11y")).toBeInTheDocument()
  })

  it("renders nothing when there are no labels", () => {
    const storageContext = createStorageContext()
    const { container } = render(
      <FirebaseContext.Provider value={storageContext}>
        <LabelsContext.Provider value={[label]}>
          <Labels onRemoveLabel={jest.fn()} />
        </LabelsContext.Provider>
      </FirebaseContext.Provider>,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it("calls onRemoveLabel with the label id when the remove button is clicked", async () => {
    const user = userEvent.setup()
    const onRemoveLabel = jest.fn()
    renderLabels(createStorageContext(), onRemoveLabel)

    await user.click(screen.getByRole("button", { name: "Remove a11y" }))

    expect(onRemoveLabel).toHaveBeenCalledWith("label-1")
  })

  it("shows a colour swatch picker when the change colour button is clicked", async () => {
    const user = userEvent.setup()
    renderLabels(createStorageContext())

    await user.click(
      screen.getByRole("button", { name: "Change a11y colour" }),
    )

    expect(screen.getByRole("button", { name: "red" })).toBeInTheDocument()
  })

  it("updates the stored label's colour when a swatch is picked", async () => {
    const user = userEvent.setup()
    const storageContext = createStorageContext()
    renderLabels(storageContext)

    await user.click(
      screen.getByRole("button", { name: "Change a11y colour" }),
    )
    await user.click(screen.getByRole("button", { name: "red" }))

    expect(storageContext.updateItem).toHaveBeenCalledWith("work-labels", {
      ...label,
      colour: "red",
    })
  })
})
