import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"

import "./index.css"
import { Project } from "./Project"
import { AddProjectForm } from "./AddProjectForm"
import {
  Category,
  PROJECT_COLOURS,
  ProjectDetails,
  PROJECTS_KEY,
} from "../../shared/types"
import { EmojiCheckbox } from "../../shared/controls/EmojiCheckbox"
import { XIcon } from "../../shared/icons/X"
import { sortByPosition } from "../../shared/drag-and-drop/utils"
import { reorderProjects } from "./utils"

export function Projects() {
  const containerRef = useRef<HTMLUListElement>(null)
  const [containerHeight, setContainerHeight] = useState<number>()
  const [filter, setFilter] = useState<Category[]>([])

  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const { value } =
    storageContext.useValue<Record<string, ProjectDetails>>(PROJECTS_KEY)
  const sortedProjects = useMemo(() => {
    const projects = value ? Object.values(value) : []
    return sortByPosition(projects).sort((a, b) => {
      if (a.status === "done" && b.status !== "done") return 1
      if (b.status === "done") return -1
      return 0
    })
  }, [value])

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(
        window.innerHeight - containerRef.current.getBoundingClientRect().top,
      )
    }
  }, [])

  const updateFilter = (filter: Category, action: "add" | "remove") => {
    if (action === "add") {
      setFilter((prev) => [...prev, filter])
    } else {
      setFilter((prev) => prev.filter((f) => f !== filter))
    }
  }

  return (
    <div className="projects-container">
      <div className="projects-filter">
        {(Object.keys(PROJECT_COLOURS) as Category[]).map((category) => (
          <EmojiCheckbox
            key={category}
            emoji={category}
            isChecked={filter.includes(category)}
            onChange={() =>
              updateFilter(
                category,
                filter.includes(category) ? "remove" : "add",
              )
            }
            label={`Filter by ${category}`}
          />
        ))}
        <button
          className="icon ghost"
          style={{ marginInlineEnd: "8px" }}
          onClick={() => setFilter([])}
        >
          <XIcon width=".6em" colour="var(--body-colour-mid)" />
        </button>
      </div>
      <ul
        className="projects"
        ref={containerRef}
        style={{ height: containerHeight }}
      >
        {sortedProjects.map((project, index) => (
          <FilteredProject key={project.id} project={project} filter={filter}>
            <Project
              project={project}
              onDelete={() => {
                storageContext.updateList(
                  PROJECTS_KEY,
                  reorderProjects(sortedProjects, index),
                )
                storageContext.deleteItem(PROJECTS_KEY, project)
              }}
              onMoveToEnd={() =>
                storageContext.updateList(PROJECTS_KEY, [
                  ...reorderProjects(sortedProjects, index),
                  { ...project, position: sortedProjects.length - 1 },
                ])
              }
            />
          </FilteredProject>
        ))}
        <li>
          <AddProjectForm />
        </li>
      </ul>
    </div>
  )
}

function FilteredProject({
  filter,
  project,
  children,
}: {
  filter: Category[]
  project: ProjectDetails
  children: React.ReactNode
}) {
  const isVisible = !filter.length || filter.includes(project.category)

  return (
    <li
      style={{
        overflow: isVisible ? "auto" : "hidden",
        transition: `max-width 1s`,
        maxWidth: isVisible ? "80vw" : "0",
        height: isVisible ? "auto" : 0,
      }}
    >
      {children}
    </li>
  )
}
