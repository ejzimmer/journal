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
  this.style.visibility = "hidden"
}
HTMLElement.prototype.showPopover = function mock(this: HTMLElement) {
  this.style.visibility = "visible"
}

// jsdom doesn't implement the Popover API, so it doesn't recognise the
// :popover-open pseudo-class either. Route it to the visibility the mocks
// above set, so code that checks popover open state can be tested here too.
const originalMatches = Element.prototype.matches
Element.prototype.matches = function mock(
  this: HTMLElement,
  selector: string,
): boolean {
  if (selector === ":popover-open") {
    return this.style.visibility === "visible"
  }
  return originalMatches.call(this, selector)
} as typeof Element.prototype.matches

// jsdom doesn't implement scrollIntoView.
Element.prototype.scrollIntoView = function mock() {}

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
