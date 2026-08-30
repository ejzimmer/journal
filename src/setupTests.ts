// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom"

HTMLDialogElement.prototype.show = function mock(this: HTMLDialogElement) {
  this.open = true
}
HTMLDialogElement.prototype.showModal = function mock(this: HTMLDialogElement) {
  this.open = true
}
HTMLDialogElement.prototype.close = function mock(this: HTMLDialogElement) {
  this.open = false
}

HTMLElement.prototype.hidePopover = function mock(this: HTMLElement) {
  this.style.display = "none"
}
HTMLElement.prototype.showPopover = function mock(this: HTMLElement) {
  this.style.removeProperty("display")
}

const originalMatches = Element.prototype.matches
Element.prototype.matches = function mock(
  this: HTMLElement,
  selector: string,
): boolean {
  if (selector === ":popover-open") {
    return this.style.display !== "none"
  }
  return originalMatches.call(this, selector)
} as typeof Element.prototype.matches

// Ensure pop-ups are hidden when first rendered
const popoverDefaultApplied = new WeakSet<Element>()
const originalSetAttribute = Element.prototype.setAttribute
Element.prototype.setAttribute = function mock(
  this: HTMLElement,
  name: string,
  value: string,
) {
  originalSetAttribute.call(this, name, value)
  if (name === "popover" && !popoverDefaultApplied.has(this)) {
    popoverDefaultApplied.add(this)
    this.style.display = "none"
  }
} as typeof Element.prototype.setAttribute

document.addEventListener("click", (event) => {
  const trigger = (event.target as Element | null)?.closest?.(
    "[popovertarget]",
  )
  if (!trigger) {
    return
  }

  const targetId = trigger.getAttribute("popovertarget")
  const target = targetId && document.getElementById(targetId)
  if (!target) {
    return
  }

  const action = trigger.getAttribute("popovertargetaction") ?? "toggle"
  const isOpen = target.matches(":popover-open")
  if (action === "show" || (action === "toggle" && !isOpen)) {
    target.showPopover()
  } else if (action === "hide" || (action === "toggle" && isOpen)) {
    target.hidePopover()
  }
})

// jsdom doesn't implement scrollIntoView.
Element.prototype.scrollIntoView = function mock() {}

// jsdom doesn't implement structuredClone, which fake-indexeddb relies on.
// A JSON round-trip is an adequate stand-in for the plain data this app
// stores (no Dates, Maps, or other structured-clone-only types).
if (typeof structuredClone === "undefined") {
  ;(globalThis as { structuredClone?: typeof structuredClone }).structuredClone =
    (value: unknown) => JSON.parse(JSON.stringify(value))
}

// jsdom doesn't do layout, so every element reports a zero rect at the
// origin. Return a plausible on-screen rect instead so code that measures
// element position (e.g. popover placement) behaves sensibly in tests.
Element.prototype.getBoundingClientRect = function mock(this: Element) {
  return {
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 100,
    bottom: 40,
    width: 100,
    height: 40,
    toJSON() {
      return this
    },
  }
}
