import { useEffect, useMemo, useRef, useState } from "react"
import { useStorageContext } from "../../shared/FirebaseContext"

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
import { packProjects, reorderProjects } from "./utils"

export function Projects() {
  const containerRef = useRef<HTMLUListElement>(null)
  const [containerHeight, setContainerHeight] = useState<number>()
  const [filterCategories, setFilterCategories] = useState<Category[]>([])

  const { useValue, updateList, deleteItem } = useStorageContext()

  const { value } = useValue<Record<string, ProjectDetails>>(PROJECTS_KEY)
  const sortedProjects = useMemo(
    () => sortByPosition(value ? Object.values(value) : []),
    [value],
  )
  const groups = useMemo(() => packProjects(sortedProjects), [sortedProjects])

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(
        window.innerHeight - containerRef.current.getBoundingClientRect().top,
      )
    }
  }, [])

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

  const renderProject = (project: ProjectDetails, as?: "li" | "div") => {
    const index = sortedProjects.indexOf(project)

    return (
      <FilteredProject
        key={project.id}
        as={as}
        project={project}
        filter={filterCategories}
      >
        <Project
          project={project}
          onDelete={() => {
            updateList(PROJECTS_KEY, reorderProjects(sortedProjects, index))
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
    )
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
      <ul
        className="projects"
        ref={containerRef}
        style={{ height: containerHeight }}
      >
        {groups.map((group) =>
          group.length === 1 ? (
            renderProject(group[0])
          ) : (
            <li className="stack" key={group.map((p) => p.id).join("-")}>
              {group.map((project) => renderProject(project, "div"))}
            </li>
          ),
        )}
        <li>
          <AddProjectForm />
        </li>
      </ul>
    </div>
  )
}

function FilteredProject({
  as: Tag = "li",
  filter: categories,
  project,
  children,
}: {
  as?: "li" | "div"
  filter: Category[]
  project: ProjectDetails
  children: React.ReactNode
}) {
  const isVisible = !categories.length || categories.includes(project.category)

  return (
    <Tag className={`project-item ${isVisible ? "" : "filtered-out"}`}>
      {children}
    </Tag>
  )
}
