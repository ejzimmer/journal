import { createRef } from "react"
import { render } from "@testing-library/react"
import { Menu, MenuHandle } from "./Menu"

function renderMenu(ref: React.RefObject<MenuHandle | null>) {
  return render(
    <Menu
      ref={ref}
      trigger={(props) => (
        <button {...props} aria-label="open menu">
          open
        </button>
      )}
    >
      {() => <Menu.Action onClick={() => {}}>action</Menu.Action>}
    </Menu>,
  )
}

describe("Menu imperative handle", () => {
  it("isOpen doesn't throw and returns a boolean", () => {
    const ref = createRef<MenuHandle>()
    renderMenu(ref)

    expect(() => ref.current?.isOpen()).not.toThrow()
    expect(typeof ref.current?.isOpen()).toBe("boolean")
  })

  it("reopen hides then shows the popover", () => {
    const ref = createRef<MenuHandle>()
    const { container } = renderMenu(ref)

    const popover = container.querySelector(".menu") as HTMLElement
    const hideSpy = jest.spyOn(popover, "hidePopover")
    const showSpy = jest.spyOn(popover, "showPopover")

    ref.current?.reopen()

    expect(hideSpy).toHaveBeenCalledTimes(1)
    expect(showSpy).toHaveBeenCalledTimes(1)
  })
})
