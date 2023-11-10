import { Button, List, useDisclosure } from "@chakra-ui/react"
import { Project, ProjectMetadata } from "./Project"
import { useState } from "react"
import styled from "@emotion/styled"
import { Category } from "../../shared/TodoList/types"
import { AddProjectModal } from "./AddProjectModal"

const PROJECTS = [
  {
    name: "Sew shirt",
    category: "🪡" as Category,
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
    category: "🪡" as Category,
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
    category: "⚒️" as Category,
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

type Props = {
  onSave: (project: ProjectMetadata) => void
}

export function Projects({ onSave }: Props) {
  const [projects, setProjects] = useState(PROJECTS)
  const { isOpen, onClose, onOpen } = useDisclosure()

  const updateProject = (index: number, project: ProjectMetadata) => {
    setProjects((projects) => projects.with(index, project))
  }

  return (
    <>
      <CentredList>
        {projects.map((project, index) => (
          <Project
            key={project.name}
            project={project}
            onChange={(updatedProject) => updateProject(index, updatedProject)}
          />
        ))}
      </CentredList>
      <Button onClick={onOpen}>New project</Button>
      <AddProjectModal isOpen={isOpen} onClose={onClose} onSave={onSave} />
    </>
  )
}

const CentredList = styled(List)`
  width: 600px;
  max-width: 100vw;
  margin: auto;
  display: flex;
  flex-direction: column;
  gap: 2em;
`
