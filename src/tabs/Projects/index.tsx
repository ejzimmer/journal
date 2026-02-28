import { useContext, useEffect, useRef, useState } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"

import "./index.css"
import { Project } from "./Project"
import { AddProjectForm } from "./AddProjectForm"
import { ProjectDetails, PROJECTS_KEY, Category } from "../../shared/types"

export function Projects() {
  const containerRef = useRef<HTMLUListElement>(null)
  const [containerHeight, setContainerHeight] = useState<number>()

  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const { value } =
    storageContext.useValue<Record<string, ProjectDetails>>(PROJECTS_KEY)
  const projects = value ? Object.values(value) : []

  const { knittingProjects, sewingProjects, otherProjects } = projects.reduce<
    Record<string, ProjectDetails[]>
  >(
    (groupedProjects, project) => {
      if (project.category === "🧶") {
        groupedProjects.knittingProjects.push(project)
      } else if (project.category === "🪡") {
        groupedProjects.sewingProjects.push(project)
      } else {
        groupedProjects.otherProjects.push(project)
      }
      return groupedProjects
    },
    { knittingProjects: [], sewingProjects: [], otherProjects: [] },
  )

  const projectNameRef = useRef<HTMLInputElement>(null)

  const addProject = (type: Category) => {
    const description = projectNameRef.current?.value
    if (!description) return

    storageContext.addItem<ProjectDetails>(PROJECTS_KEY, {
      description,
      category: type,
    })

    projectNameRef.current!.value = ""
  }

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(
        window.innerHeight - containerRef.current.getBoundingClientRect().top,
      )
    }
  }, [])

  return (
    <div className="projects-container">
      <div className="knitting-sewing">
        <ul>
          {knittingProjects.map((project) => (
            <Project key={project.id} project={project} />
          ))}
        </ul>
        <ul>
          {sewingProjects.map((project) => (
            <Project key={project.id} project={project} />
          ))}
        </ul>
        <div>
          <input ref={projectNameRef} className="subtle" />
          <div className="buttons">
            <button className="outline" onClick={() => addProject("🧶")}>
              🧶
            </button>
            <button className="outline" onClick={() => addProject("🪡")}>
              🪡
            </button>
          </div>
        </div>
      </div>
      <ul
        className="projects"
        ref={containerRef}
        style={{ height: containerHeight }}
      >
        {otherProjects.map((project) => (
          <Project key={project.id} project={project} />
        ))}
        <li>
          <AddProjectForm />
        </li>
      </ul>
    </div>
  )
}
