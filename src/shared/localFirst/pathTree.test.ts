import { getAtPath, pathsAreRelated, setAtPath } from "./pathTree"

describe("getAtPath", () => {
  it("reads a nested value", () => {
    const tree = { a: { b: { c: 1 } } }
    expect(getAtPath(tree, "a/b/c")).toBe(1)
  })

  it("returns undefined for a missing path", () => {
    expect(getAtPath({ a: {} }, "a/b/c")).toBeUndefined()
  })

  it("reads a top-level primitive", () => {
    expect(getAtPath({ count: 5 }, "count")).toBe(5)
  })
})

describe("setAtPath", () => {
  it("sets a nested value without mutating the original tree", () => {
    const tree = { a: { b: 1 } }
    const result = setAtPath(tree, "a/c", 2)

    expect(result).toEqual({ a: { b: 1, c: 2 } })
    expect(tree).toEqual({ a: { b: 1 } })
  })

  it("creates intermediate objects that don't exist yet", () => {
    const result = setAtPath({}, "a/b/c", 1)
    expect(result).toEqual({ a: { b: { c: 1 } } })
  })

  it("deletes a leaf when set to null", () => {
    const tree = { a: { b: 1, c: 2 } }
    expect(setAtPath(tree, "a/b", null)).toEqual({ a: { c: 2 } })
  })

  it("deletes a leaf when set to undefined", () => {
    const tree = { a: { b: 1, c: 2 } }
    expect(setAtPath(tree, "a/b", undefined)).toEqual({ a: { c: 2 } })
  })

  it("removes a parent left with no children after a delete", () => {
    const tree = { a: { b: 1 } }
    expect(setAtPath(tree, "a/b", null)).toEqual({})
  })

  it("removes nested empty parents all the way up", () => {
    const tree = { a: { b: { c: 1 } } }
    expect(setAtPath(tree, "a/b/c", null)).toEqual({})
  })

  it("keeps sibling keys when deleting one leaf", () => {
    const tree = { a: { b: 1 }, other: true }
    expect(setAtPath(tree, "a/b", null)).toEqual({ other: true })
  })
})

describe("pathsAreRelated", () => {
  it("is true for identical paths", () => {
    expect(pathsAreRelated("a/b", "a/b")).toBe(true)
  })

  it("is true when one path is nested inside the other", () => {
    expect(pathsAreRelated("a", "a/b/c")).toBe(true)
    expect(pathsAreRelated("a/b/c", "a")).toBe(true)
  })

  it("is false for unrelated paths", () => {
    expect(pathsAreRelated("a/b", "a/c")).toBe(false)
  })

  it("doesn't treat a path as related just by sharing a string prefix", () => {
    expect(pathsAreRelated("ab", "abc")).toBe(false)
  })
})
