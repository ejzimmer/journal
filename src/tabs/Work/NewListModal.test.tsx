import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NewListModal } from "./NewListModal"
import { WorkStorageContext } from "./WorkStorageContext"
import { createWorkStorageContext } from "./workStorageTestUtils"
import { StoredLabel } from "./types"

const mockLabels: StoredLabel[] = [
  { id: "id-a11y", value: "a11y", colour: "blue" },
  { id: "id-i18n", value: "i18n", colour: "yellow" },
]

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <WorkStorageContext.Provider
    value={createWorkStorageContext({ labels: mockLabels })}
  >
    {children}
  </WorkStorageContext.Provider>
)

const openModal = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: "➕ Add list" }))
}

describe("NewListModal", () => {
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

    expect(onCreate).toHaveBeenCalledWith("Backlog", undefined)
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

    expect(onCreate).toHaveBeenCalledWith("Backlog", {
      value: "a11y",
      colour: "blue",
    })
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

    expect(onCreate).toHaveBeenCalledWith("Backlog", {
      value: "urgent",
      colour: "purple",
    })
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
