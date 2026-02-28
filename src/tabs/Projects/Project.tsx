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
  ProjectSubtask,
} from "../../shared/types"
import { ArrowRightIcon } from "../../shared/icons/ArrowRight"
import { ButtonWithConfirmation } from "../../shared/controls/ButtonWithConfirmation"
import { getSubtasksKey, useLinkedTasks } from "./utils"

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

  const { createLinkedTask: createDailyTask, updateLinkedTask } =
    useLinkedTasks(project.linkedTaskId)

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

    updateLinkedTask({
      status: project.status === "done" ? "ready" : "finished",
      lastCompleted: new Date().getTime(),
    })
  }

  const onAddToTodo = () => {
    if (project.subtasks) {
      Object.values(project.subtasks).forEach((task) => {
        if (task.status === "done" || task.linkedId) {
          return
        }

        const linkedId = createDailyTask({
          description: task.description,
          category: task.category,
          linkedTaskId: getSubtasksKey(project.id, task.id),
        })

        if (linkedId) {
          storageContext.updateItem<ProjectSubtask>(
            getSubtasksKey(project.id),
            {
              ...task,
              linkedId,
            },
          )
        }
      })
    } else {
      const linkedTaskId = createDailyTask({
        description: project.description,
        category: project.category,
        linkedTaskId: `${PROJECTS_KEY}/${project.id}`,
      })

      if (linkedTaskId) {
        storageContext.updateItem<ProjectDetails>(PROJECTS_KEY, {
          ...project,
          linkedTaskId,
        })
      }
    }
    return true
  }

  return (
    <div className={`project ${project.status}`} style={projectColour}>
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
          onCancel={() => {
            setConfirmDeleteModalOpen(false)
          }}
          isOpen={confirmDeleteModalOpen}
        />
        <ButtonWithConfirmation
          className="icon ghost copy-project-button"
          onClick={onAddToTodo}
        >
          <ArrowRightIcon colour="var(--action-colour)" width="16px" />
        </ButtonWithConfirmation>

        <button
          className={`ghost expand ${subtasksVisible ? "expanded" : ""}`}
          onClick={() => setSubtasksVisible(!subtasksVisible)}
          style={{ marginInlineStart: "auto" }}
        >
          <ChevronDownIcon width="20px" />
        </button>
      </div>
      <SubtaskList projectId={project.id} isVisible={subtasksVisible} />
    </div>
  )
}
