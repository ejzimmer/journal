import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { DragHandle } from "./DragHandle"
import { OrderedListItem } from "./types"

const list: OrderedListItem[] = [
  { id: "a", parentId: "list", position: 0 },
  { id: "b", parentId: "list", position: 1 },
  { id: "c", parentId: "list", position: 2 },
]

function focusHandle() {
  screen.getByRole("button", { name: "drag menu" }).focus()
}

describe("DragHandle keyboard shortcuts", () => {
  describe("ArrowUp / ArrowDown", () => {
    it("moves the item up when ArrowUp is pressed", async () => {
      const user = userEvent.setup()
      const onReorder = jest.fn()
      render(<DragHandle list={list} index={1} onReorder={onReorder} />)

      focusHandle()
      await user.keyboard("{ArrowUp}")

      expect(onReorder).toHaveBeenCalledTimes(1)
      const reordered = onReorder.mock.calls[0][0]
      expect(reordered.map((item: OrderedListItem) => item.id)).toEqual([
        "b",
        "a",
        "c",
      ])
    })

    it("moves the item down when ArrowDown is pressed", async () => {
      const user = userEvent.setup()
      const onReorder = jest.fn()
      render(<DragHandle list={list} index={0} onReorder={onReorder} />)

      focusHandle()
      await user.keyboard("{ArrowDown}")

      expect(onReorder).toHaveBeenCalledTimes(1)
      const reordered = onReorder.mock.calls[0][0]
      expect(reordered.map((item: OrderedListItem) => item.id)).toEqual([
        "b",
        "a",
        "c",
      ])
    })

    it("does nothing when ArrowUp is pressed on the first item", async () => {
      const user = userEvent.setup()
      const onReorder = jest.fn()
      render(<DragHandle list={list} index={0} onReorder={onReorder} />)

      focusHandle()
      await user.keyboard("{ArrowUp}")

      expect(onReorder).not.toHaveBeenCalled()
    })

    it("does nothing when ArrowDown is pressed on the last item", async () => {
      const user = userEvent.setup()
      const onReorder = jest.fn()
      render(<DragHandle list={list} index={2} onReorder={onReorder} />)

      focusHandle()
      await user.keyboard("{ArrowDown}")

      expect(onReorder).not.toHaveBeenCalled()
    })
  })

  describe("Shift+ArrowUp / Shift+ArrowDown", () => {
    it("moves the item to the top of the list", async () => {
      const user = userEvent.setup()
      const onReorder = jest.fn()
      render(<DragHandle list={list} index={2} onReorder={onReorder} />)

      focusHandle()
      await user.keyboard("{Shift>}{ArrowUp}{/Shift}")

      expect(onReorder).toHaveBeenCalledTimes(1)
      const reordered = onReorder.mock.calls[0][0]
      expect(reordered.map((item: OrderedListItem) => item.id)).toEqual([
        "c",
        "a",
        "b",
      ])
    })

    it("moves the item to the bottom of the list", async () => {
      const user = userEvent.setup()
      const onReorder = jest.fn()
      render(<DragHandle list={list} index={0} onReorder={onReorder} />)

      focusHandle()
      await user.keyboard("{Shift>}{ArrowDown}{/Shift}")

      expect(onReorder).toHaveBeenCalledTimes(1)
      const reordered = onReorder.mock.calls[0][0]
      expect(reordered.map((item: OrderedListItem) => item.id)).toEqual([
        "b",
        "c",
        "a",
      ])
    })
  })

  describe("keys DragHandle doesn't itself handle", () => {
    it("does nothing when additionalActions isn't provided", async () => {
      const user = userEvent.setup()
      const onReorder = jest.fn()
      render(<DragHandle list={list} index={1} onReorder={onReorder} />)

      focusHandle()
      await user.keyboard("{ArrowLeft}")
      await user.keyboard("{ArrowRight}")

      expect(onReorder).not.toHaveBeenCalled()
    })

    it("forwards ArrowLeft to additionalActions.onKeyDown", async () => {
      const user = userEvent.setup()
      const onKeyDown = jest.fn()
      render(
        <DragHandle
          list={list}
          index={1}
          onReorder={jest.fn()}
          additionalActions={{ onKeyDown }}
        />,
      )

      focusHandle()
      await user.keyboard("{ArrowLeft}")

      expect(onKeyDown).toHaveBeenCalledTimes(1)
      expect(onKeyDown.mock.calls[0][0]).toEqual(
        expect.objectContaining({ key: "ArrowLeft", shiftKey: false }),
      )
    })

    it("forwards Shift+ArrowRight to additionalActions.onKeyDown", async () => {
      const user = userEvent.setup()
      const onKeyDown = jest.fn()
      render(
        <DragHandle
          list={list}
          index={1}
          onReorder={jest.fn()}
          additionalActions={{ onKeyDown }}
        />,
      )

      focusHandle()
      await user.keyboard("{Shift>}{ArrowRight}{/Shift}")

      const arrowRightCall = onKeyDown.mock.calls.find(
        ([event]) => event.key === "ArrowRight",
      )
      expect(arrowRightCall?.[0]).toEqual(
        expect.objectContaining({ key: "ArrowRight", shiftKey: true }),
      )
    })

    it("doesn't forward ArrowUp/ArrowDown, which it handles itself", async () => {
      const user = userEvent.setup()
      const onKeyDown = jest.fn()
      render(
        <DragHandle
          list={list}
          index={1}
          onReorder={jest.fn()}
          additionalActions={{ onKeyDown }}
        />,
      )

      focusHandle()
      await user.keyboard("{ArrowUp}")
      await user.keyboard("{ArrowDown}")

      expect(onKeyDown).not.toHaveBeenCalled()
    })
  })

  it("doesn't close the menu after a keyboard move", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <DragHandle list={list} index={2} onReorder={jest.fn()} />,
    )

    await user.click(screen.getByRole("button", { name: "drag menu" }))
    const popover = container.querySelector(".menu") as HTMLElement
    const hideSpy = jest.spyOn(popover, "hidePopover")

    focusHandle()
    await user.keyboard("{Shift>}{ArrowUp}{/Shift}")

    expect(hideSpy).not.toHaveBeenCalled()
  })
})
