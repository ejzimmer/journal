import { useState } from "react"
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

    it("still prevents the page from scrolling when ArrowUp is a no-op at the top", () => {
      render(<DragHandle list={list} index={0} onReorder={jest.fn()} />)

      const button = screen.getByRole("button", { name: "drag menu" })
      button.focus()
      const event = new KeyboardEvent("keydown", {
        key: "ArrowUp",
        bubbles: true,
        cancelable: true,
      })
      button.dispatchEvent(event)

      expect(event.defaultPrevented).toBe(true)
    })

    it("still prevents the page from scrolling when ArrowDown is a no-op at the bottom", () => {
      render(<DragHandle list={list} index={2} onReorder={jest.fn()} />)

      const button = screen.getByRole("button", { name: "drag menu" })
      button.focus()
      const event = new KeyboardEvent("keydown", {
        key: "ArrowDown",
        bubbles: true,
        cancelable: true,
      })
      button.dispatchEvent(event)

      expect(event.defaultPrevented).toBe(true)
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

  describe("focus after a real reorder", () => {
    function ReorderableList({
      initialList,
    }: {
      initialList: OrderedListItem[]
    }) {
      const [items, setItems] = useState(initialList)
      return (
        <ul>
          {items.map((item, index) => (
            <li key={item.id}>
              {item.id}
              <DragHandle list={items} index={index} onReorder={setItems} />
            </li>
          ))}
        </ul>
      )
    }

    it("keeps focus on the moved item's drag handle after moving down", async () => {
      const user = userEvent.setup()
      render(<ReorderableList initialList={list} />)

      // "b" starts at index 1
      screen.getAllByRole("button", { name: "drag menu" })[1].focus()
      await user.keyboard("{ArrowDown}")

      // "b" is now at index 2
      const handlesAfter = screen.getAllByRole("button", { name: "drag menu" })
      expect(handlesAfter[2]).toHaveFocus()
    })

    it("keeps focus on the moved item's drag handle after Shift+ArrowUp to the top", async () => {
      const user = userEvent.setup()
      render(<ReorderableList initialList={list} />)

      // "c" starts at index 2
      screen.getAllByRole("button", { name: "drag menu" })[2].focus()
      await user.keyboard("{Shift>}{ArrowUp}{/Shift}")

      // "c" is now at index 0
      const handlesAfter = screen.getAllByRole("button", { name: "drag menu" })
      expect(handlesAfter[0]).toHaveFocus()
    })

    it("keeps focus after moving several positions in a row", async () => {
      const user = userEvent.setup()
      render(<ReorderableList initialList={list} />)

      // "a" starts at index 0
      screen.getAllByRole("button", { name: "drag menu" })[0].focus()
      await user.keyboard("{ArrowDown}")
      await user.keyboard("{ArrowDown}")

      // "a" is now at index 2, and still focused throughout
      const handlesAfter = screen.getAllByRole("button", { name: "drag menu" })
      expect(handlesAfter[2]).toHaveFocus()
    })
  })
})
