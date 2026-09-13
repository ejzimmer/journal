import { CSSProperties, useEffect, useMemo, useRef, useState } from "react"
import { useStorageContext } from "../../shared/FirebaseContext"

import "./index.css"
import { Project } from "./Project"
import { AddProjectForm } from "./AddProjectForm"
import {
  Category,
  PROJECT_COLOURS,
  ProjectDetails,
  ProjectSubtask,
  PROJECTS_KEY,
} from "../../shared/types"
import { EmojiCheckbox } from "../../shared/controls/EmojiCheckbox"
import { XIcon } from "../../shared/icons/X"
import { sortByPosition } from "../../shared/drag-and-drop/utils"
import { getSubtasksKey, reorderProjects } from "./utils"
import { useGridColumnSpan } from "./useGridColumnSpan"
import { ProjectsSkeleton } from "./ProjectsSkeleton"

export function Projects() {
  const [filterCategories, setFilterCategories] = useState<Category[]>([])

  const { useValue, updateList, updateItem, deleteItem } = useStorageContext()

  const { value, loading } = useValue<Record<string, ProjectDetails>>(
    PROJECTS_KEY,
  )
  const sortedProjects = useMemo(
    () => sortByPosition(value ? Object.values(value) : []),
    [value],
  )

  const hasMigratedSubtaskPositions = useRef(false)
  useEffect(() => {
    if (loading || hasMigratedSubtaskPositions.current) return
    hasMigratedSubtaskPositions.current = true

    sortedProjects.forEach((project) => {
      const subtasks: ProjectSubtask[] = Object.values(project.subtasks ?? {})
      if (!subtasks.some((task) => task.position == null)) return

      const originalPositions = new Map(
        subtasks.map((task) => [task.id, task.position]),
      )
      const fixedSubtasks = sortByPosition(
        subtasks.map((task) => ({
          ...task,
          position: task.position ?? Infinity,
        })),
      )

      fixedSubtasks.forEach((task) => {
        if (task.position !== originalPositions.get(task.id)) {
          updateItem<ProjectSubtask>(getSubtasksKey(project.id), task)
        }
      })
    })
  }, [loading, sortedProjects, updateItem])

  const updateFilterCategories = (
    category: Category,
    action: "add" | "remove",
  ) => {
    if (action === "add") {
      setFilterCategories((prev) => [...prev, category])
    } else {
      setFilterCategories((prev) => prev.filter((f) => f !== category))
    }
  }

  return (
    <div className="projects-container">
      <div className="projects-filter">
        {(Object.keys(PROJECT_COLOURS) as Category[]).map((category) => (
          <EmojiCheckbox
            key={category}
            emoji={category}
            isChecked={filterCategories.includes(category)}
            onChange={() =>
              updateFilterCategories(
                category,
                filterCategories.includes(category) ? "remove" : "add",
              )
            }
            label={`Filter by ${category}`}
          />
        ))}
        <button
          className="icon ghost"
          style={{ marginInlineEnd: "8px" }}
          onClick={() => setFilterCategories([])}
        >
          <XIcon width=".6em" colour="var(--body-colour-mid)" />
        </button>
      </div>
      <ul className="projects">
        {loading ? (
          <ProjectsSkeleton />
        ) : (
          sortedProjects.map((project, index) => (
            <FilteredProject
              key={project.id}
              project={project}
              filter={filterCategories}
            >
              <Project
                project={project}
                onDelete={() => {
                  updateList(
                    PROJECTS_KEY,
                    reorderProjects(sortedProjects, index),
                  )
                  deleteItem(PROJECTS_KEY, project)
                }}
                onMoveToEnd={() =>
                  updateList(PROJECTS_KEY, [
                    ...reorderProjects(sortedProjects, index),
                    { ...project, position: sortedProjects.length - 1 },
                  ])
                }
              />
            </FilteredProject>
          ))
        )}
      </ul>
      <AddProjectForm />
    </div>
  )
}

function FilteredProject({
  filter: categories,
  project,
  children,
}: {
  filter: Category[]
  project: ProjectDetails
  children: React.ReactNode
}) {
  const itemRef = useRef<HTMLLIElement>(null)
  const isVisible = !categories.length || categories.includes(project.category)
  const rowSpan = (project.status ?? "ready") === "in_progress" ? 2 : 1

  useGridColumnSpan(itemRef, project, isVisible)

  return (
    <li
      ref={itemRef}
      className={`project-item ${isVisible ? "" : "filtered-out"}`}
      style={{ "--row-span": rowSpan } as CSSProperties}
    >
      {children}
    </li>
  )
}
