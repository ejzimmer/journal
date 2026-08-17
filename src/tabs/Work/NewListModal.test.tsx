import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NewListModal } from "./NewListModal"
import { LabelsContext } from "./LabelsContext"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { Label } from "./types"

const mockLabels: Label[] = [
  { id: "label-a11y", value: "a11y", colour: "blue" },
  { id: "label-i18n", value: "i18n", colour: "yellow" },
]

let storageContext: ReturnType<typeof createStorageContext>

function createStorageContext() {
  return {
    addItem: jest.fn(() => "new-label-id"),
    updateItem: jest.fn(),
    deleteItem: jest.fn(),
    updateList: jest.fn(),
    useValue: () => ({ value: undefined, loading: false }),
  }
}

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <FirebaseContext.Provider value={storageContext}>
    <LabelsContext.Provider value={mockLabels}>
      {children}
    </LabelsContext.Provider>
  </FirebaseContext.Provider>
)

const openModal = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: "➕ Add list" }))
}

describe("NewListModal", () => {
  beforeEach(() => {
    storageContext = createStorageContext()
  })

  it("creates a list with just a name", async () => {
    const user = userEvent.setup()
    const onCreate = jest.fn()
    render(<NewListModal onCreate={onCreate} />, { wrapper: Wrapper })

    await openModal(user)
    await user.type(
      screen.getByRole("textbox", { name: "New list name" }),
      "Backlog",
    )
    await user.click(screen.getByRole("button", { name: "Create" }))

    expect(onCreate).toHaveBeenCalledWith("Backlog", [])
  })

  it("creates a list with an existing label", async () => {
    const user = userEvent.setup()
    const onCreate = jest.fn()
    render(<NewListModal onCreate={onCreate} />, { wrapper: Wrapper })

    await openModal(user)
    await user.type(
      screen.getByRole("textbox", { name: "New list name" }),
      "Backlog",
    )
    fireEvent.change(screen.getByRole("combobox", { name: "Label" }), {
      target: { value: "a11y" },
    })
    await user.click(screen.getByRole("button", { name: "Create" }))

    expect(onCreate).toHaveBeenCalledWith("Backlog", [mockLabels[0].id])
  })

  it("creates a list with a new label", async () => {
    const user = userEvent.setup()
    const onCreate = jest.fn()
    render(<NewListModal onCreate={onCreate} />, { wrapper: Wrapper })

    await openModal(user)
    await user.type(
      screen.getByRole("textbox", { name: "New list name" }),
      "Backlog",
    )
    fireEvent.change(screen.getByRole("combobox", { name: "Label" }), {
      target: { value: "urgent" },
    })
    await user.click(screen.getByRole("button", { name: "Create" }))

    expect(storageContext.addItem).toHaveBeenCalledWith("work-labels", {
      value: "urgent",
      colour: "purple",
    })
    expect(onCreate).toHaveBeenCalledWith("Backlog", ["new-label-id"])
  })

  it("doesn't create a list without a name", async () => {
    const user = userEvent.setup()
    const onCreate = jest.fn()
    render(<NewListModal onCreate={onCreate} />, { wrapper: Wrapper })

    await openModal(user)
    await user.click(screen.getByRole("button", { name: "Create" }))

    expect(onCreate).not.toHaveBeenCalled()
    expect(screen.getByText("List name is required")).toBeInTheDocument()
  })
})
