import { List } from "@chakra-ui/react"
import { Project, ProjectMetadata } from "./Project"
import { useState } from "react"

const PROJECTS = [
  {
    name: "Sew shirt",
    tasks: [
      {
        description: "Trace pattern",
        isDone: true,
      },
      {
        description: "Cut fabric",
        isDone: false,
      },
      {
        description: "Adjust fit",
        isDone: false,
      },
      {
        description: "Sew everything together",
        isDone: false,
      },
    ],
  },
  {
    name: "Sew jeans",
    tasks: [
      {
        description: "Prewash fabric",
        isDone: false,
      },
      {
        description: "Trace pattern",
        isDone: true,
      },
      {
        description: "Cut fabric",
        isDone: false,
      },
      {
        description: "Adjust fit",
        isDone: false,
      },
      {
        description: "Sew everything together",
        isDone: false,
      },
    ],
  },
  {
    name: "Organise sewing room",
    tasks: [
      {
        description: "Sell sewing table",
        isDone: false,
      },
      {
        description: "Make cutting table",
        isDone: false,
      },
      {
        description: "Put up shelves",
        isDone: false,
      },
    ],
  },
]

export function Projects() {
  const [projects, setProjects] = useState(PROJECTS)

  const updateProject = (index: number, project: ProjectMetadata) => {
    setProjects((projects) => projects.with(index, project))
  }

  return (
    <List>
      {projects.map((project, index) => (
        <Project
          key={project.name}
          project={project}
          onChange={(updatedProject) => updateProject(index, updatedProject)}
        />
      ))}
    </List>
  )
}
