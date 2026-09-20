import { ProjectDetails, PROJECTS_KEY } from "../../shared/types"
import {
  isProjectAtEnd,
  isProjectAtStart,
  moveProjectToEnd,
  moveProjectToStart,
} from "./utils"

const createProjects = (
  statuses: ProjectDetails["status"][],
): ProjectDetails[] =>
  statuses.map((status, index) => ({
    id: `project-${index}`,
    parentId: PROJECTS_KEY,
    description: `Project ${index}`,
    category: "🧶",
    status,
    position: index,
  }))

const getIds = (projects: ProjectDetails[]) =>
  projects.map((project) => project.id)

describe("moveProjectToStart", () => {
  it("moves the project to the start when the first project isn't in progress", () => {
    const projects = createProjects(["ready", "ready", "in_progress"])

    expect(getIds(moveProjectToStart(projects, 2))).toEqual([
      "project-2",
      "project-0",
      "project-1",
    ])
  })

  it("moves the project after the leading in progress projects", () => {
    const projects = createProjects([
      "in_progress",
      "in_progress",
      "in_progress",
      "ready",
      "in_progress",
    ])

    expect(getIds(moveProjectToStart(projects, 4))).toEqual([
      "project-0",
      "project-1",
      "project-2",
      "project-4",
      "project-3",
    ])
  })

  it("ignores in progress projects that don't lead the list", () => {
    const projects = createProjects([
      "ready",
      "in_progress",
      "in_progress",
      "in_progress",
    ])

    expect(getIds(moveProjectToStart(projects, 3))).toEqual([
      "project-3",
      "project-0",
      "project-1",
      "project-2",
    ])
  })

  it("leaves a project inside the leading in progress run where it is", () => {
    const projects = createProjects([
      "in_progress",
      "in_progress",
      "in_progress",
      "ready",
    ])

    expect(getIds(moveProjectToStart(projects, 1))).toEqual([
      "project-0",
      "project-1",
      "project-2",
      "project-3",
    ])
  })

  it("never moves a project further from the start", () => {
    const projects = createProjects(["in_progress", "in_progress"])

    expect(getIds(moveProjectToStart(projects, 0))).toEqual([
      "project-0",
      "project-1",
    ])
  })

  it("treats a project with no status as not in progress", () => {
    const projects = createProjects([undefined, "in_progress"])

    expect(getIds(moveProjectToStart(projects, 1))).toEqual([
      "project-1",
      "project-0",
    ])
  })

  it("renumbers positions", () => {
    const projects = createProjects(["ready", "ready", "in_progress"])

    expect(
      moveProjectToStart(projects, 2).map((project) => project.position),
    ).toEqual([0, 1, 2])
  })
})

describe("moveProjectToEnd", () => {
  it("moves the project to just before the done projects", () => {
    const projects = createProjects(["in_progress", "ready", "done", "done"])

    expect(getIds(moveProjectToEnd(projects, 0))).toEqual([
      "project-1",
      "project-0",
      "project-2",
      "project-3",
    ])
  })

  it("moves the project to the end when no projects are done", () => {
    const projects = createProjects(["in_progress", "ready", "ready"])

    expect(getIds(moveProjectToEnd(projects, 0))).toEqual([
      "project-1",
      "project-2",
      "project-0",
    ])
  })

  it("leaves the project in place when it already sits before the done projects", () => {
    const projects = createProjects(["ready", "in_progress", "done"])

    expect(getIds(moveProjectToEnd(projects, 1))).toEqual([
      "project-0",
      "project-1",
      "project-2",
    ])
  })

  it("renumbers positions", () => {
    const projects = createProjects(["in_progress", "ready", "done"])

    expect(
      moveProjectToEnd(projects, 0).map((project) => project.position),
    ).toEqual([0, 1, 2])
  })
})

describe("isProjectAtStart", () => {
  it("is true for the first project when nothing is in progress before it", () => {
    const projects = createProjects(["in_progress", "ready", "ready"])

    expect(isProjectAtStart(projects, 0)).toBe(true)
  })

  it("is true for a project already sitting after the leading in progress run", () => {
    const projects = createProjects(["in_progress", "in_progress", "ready"])

    expect(isProjectAtStart(projects, 1)).toBe(true)
  })

  it("is true for the first project even when the one after it is in progress", () => {
    const projects = createProjects(["in_progress", "in_progress", "ready"])

    expect(isProjectAtStart(projects, 0)).toBe(true)
  })

  it("is false for a project below the leading in progress run", () => {
    const projects = createProjects(["in_progress", "ready", "in_progress"])

    expect(isProjectAtStart(projects, 2)).toBe(false)
  })

  it("is true for the only project in the list", () => {
    const projects = createProjects(["in_progress"])

    expect(isProjectAtStart(projects, 0)).toBe(true)
  })
})

describe("isProjectAtEnd", () => {
  it("is true for a project already directly before the done projects", () => {
    const projects = createProjects(["ready", "in_progress", "done"])

    expect(isProjectAtEnd(projects, 1)).toBe(true)
  })

  it("is true for the last project when nothing is done", () => {
    const projects = createProjects(["ready", "ready", "in_progress"])

    expect(isProjectAtEnd(projects, 2)).toBe(true)
  })

  it("is false for a project above other unfinished projects", () => {
    const projects = createProjects(["in_progress", "ready", "done"])

    expect(isProjectAtEnd(projects, 0)).toBe(false)
  })

  it("is true for the only project in the list", () => {
    const projects = createProjects(["in_progress"])

    expect(isProjectAtEnd(projects, 0)).toBe(true)
  })

  it("is true for the last project even when a done project sits above it", () => {
    const projects = createProjects(["done", "in_progress"])

    expect(isProjectAtEnd(projects, 1)).toBe(true)
  })
})
