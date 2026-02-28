import { CSSProperties, useContext, useState } from "react"
import { EditableText } from "../../shared/controls/EditableText"
import { FirebaseContext } from "../../shared/FirebaseContext"

import "./Project.css"
import { EmojiCheckbox } from "../../shared/controls/EmojiCheckbox"
import { ConfirmationModalDialog } from "../../shared/controls/ConfirmationModal"
import { ChevronDownIcon } from "../../shared/icons/ChevronDown"
import { SubtaskList } from "./SubtaskList"
import {
  ProjectDetails,
  PROJECT_COLOURS,
  PROJECTS_KEY,
} from "../../shared/types"

type ProjectProps = {
  project: ProjectDetails
}

export function Project({ project }: ProjectProps) {
  const [subtasksVisible, setSubtasksVisible] = useState(false)
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false)

  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const projectColour = {
    "--project-colour":
      project.category in PROJECT_COLOURS
        ? PROJECT_COLOURS[project.category]
        : "white",
  } as CSSProperties

  const onChangeStatus = () => {
    if (project.status === "ready") {
      storageContext.updateItem(PROJECTS_KEY, {
        ...project,
        status: "in_progress",
      })
    } else if (project.status === "in_progress") {
      storageContext.updateItem(PROJECTS_KEY, { ...project, status: "done" })
    } else {
      storageContext.updateItem(PROJECTS_KEY, { ...project, status: "ready" })
    }
  }

  return (
    <li className={`project ${project.status}`} style={projectColour}>
      <div className="project-details">
        <EmojiCheckbox
          emoji={project.category}
          isChecked={project.status === "in_progress"}
          onChange={onChangeStatus}
          label={""}
        />
        <EditableText
          label="project"
          onChange={(description) => {
            if (!description) {
              setConfirmDeleteModalOpen(true)
              return
            }
            storageContext.updateItem<ProjectDetails>(PROJECTS_KEY, {
              ...project,
              description,
            })
          }}
          style={{
            fontSize: "1em",
          }}
        >
          {project.description}
        </EditableText>
        <ConfirmationModalDialog
          message={`Are you sure you want to delete ${project.description}`}
          onConfirm={() => storageContext.deleteItem(PROJECTS_KEY, project)}
          isOpen={confirmDeleteModalOpen}
        />
        <button
          className={`ghost expand ${subtasksVisible ? "expanded" : ""}`}
          onClick={() => setSubtasksVisible(!subtasksVisible)}
          style={{ marginInlineStart: "auto" }}
        >
          <ChevronDownIcon width="20px" />
        </button>
      </div>
      <SubtaskList projectId={project.id} isVisible={subtasksVisible} />
    </li>
  )
}
