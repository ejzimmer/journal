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

  describe("ArrowLeft / ArrowRight", () => {
    it("does nothing when onMoveToAdjacentList isn't provided", async () => {
      const user = userEvent.setup()
      const onReorder = jest.fn()
      render(<DragHandle list={list} index={1} onReorder={onReorder} />)

      focusHandle()
      await user.keyboard("{ArrowLeft}")
      await user.keyboard("{ArrowRight}")

      expect(onReorder).not.toHaveBeenCalled()
    })

    it("calls onMoveToAdjacentList with 'previous' on ArrowLeft", async () => {
      const user = userEvent.setup()
      const onMoveToAdjacentList = jest.fn()
      render(
        <DragHandle
          list={list}
          index={1}
          onReorder={jest.fn()}
          onMoveToAdjacentList={onMoveToAdjacentList}
        />,
      )

      focusHandle()
      await user.keyboard("{ArrowLeft}")

      expect(onMoveToAdjacentList).toHaveBeenCalledWith("previous")
    })

    it("calls onMoveToAdjacentList with 'next' on ArrowRight", async () => {
      const user = userEvent.setup()
      const onMoveToAdjacentList = jest.fn()
      render(
        <DragHandle
          list={list}
          index={1}
          onReorder={jest.fn()}
          onMoveToAdjacentList={onMoveToAdjacentList}
        />,
      )

      focusHandle()
      await user.keyboard("{ArrowRight}")

      expect(onMoveToAdjacentList).toHaveBeenCalledWith("next")
    })

    it("calls onMoveToAdjacentList with 'first' on Shift+ArrowLeft", async () => {
      const user = userEvent.setup()
      const onMoveToAdjacentList = jest.fn()
      render(
        <DragHandle
          list={list}
          index={1}
          onReorder={jest.fn()}
          onMoveToAdjacentList={onMoveToAdjacentList}
        />,
      )

      focusHandle()
      await user.keyboard("{Shift>}{ArrowLeft}{/Shift}")

      expect(onMoveToAdjacentList).toHaveBeenCalledWith("first")
    })

    it("calls onMoveToAdjacentList with 'last' on Shift+ArrowRight", async () => {
      const user = userEvent.setup()
      const onMoveToAdjacentList = jest.fn()
      render(
        <DragHandle
          list={list}
          index={1}
          onReorder={jest.fn()}
          onMoveToAdjacentList={onMoveToAdjacentList}
        />,
      )

      focusHandle()
      await user.keyboard("{Shift>}{ArrowRight}{/Shift}")

      expect(onMoveToAdjacentList).toHaveBeenCalledWith("last")
    })
  })
})
