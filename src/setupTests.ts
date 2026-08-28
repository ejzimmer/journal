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

// display:none (not visibility:hidden) so this matches the real UA
// stylesheet's mechanism: visibility is inherited, which would otherwise
// make every *descendant* of a closed popover compute an empty accessible
// name (dom-accessibility-api treats an inherited visibility:hidden as
// "no text alternative"), even for ones testing-library's `hidden: true`
// option correctly makes findable again. display doesn't inherit, so a
// child's own name computation is unaffected - only the ancestor-walking
// isInaccessible() check (which getByRole/hidden:true goes through) sees it.
HTMLElement.prototype.hidePopover = function mock(this: HTMLElement) {
  this.style.display = "none"
}
HTMLElement.prototype.showPopover = function mock(this: HTMLElement) {
  this.style.removeProperty("display")
}

// jsdom doesn't implement the Popover API, so it doesn't recognise the
// :popover-open pseudo-class either. Route it to the display the mocks
// above set, so code that checks popover open state can be tested here too.
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

// Real browsers hide a popover element by default (via the UA stylesheet)
// as soon as it gets the popover attribute, until something explicitly
// shows it. jsdom has no such default, so without this, a popover that's
// never had showPopover() called on it would read as visible here. This
// only sets that initial default once per element - after that, the
// show/hide mocks above are the sole source of truth, so a later re-render
// re-setting the same attribute can't stomp on a popover that's already
// open.
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

// Real browsers open/close/toggle a popover natively when a
// popovertarget button is clicked, with no JS required. jsdom doesn't
// implement that either, so wire it up by hand: on any click, walk up to
// the nearest [popovertarget], look up its target by id, and apply
// popovertargetaction (defaulting to "toggle", same as the spec).
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
