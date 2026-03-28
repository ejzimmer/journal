import { CSSProperties, useContext, useState } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"

import "./Project.css"
import { EmojiCheckbox } from "../../shared/controls/EmojiCheckbox"
import { ChevronDownIcon } from "../../shared/icons/ChevronDown"
import { SubtaskList } from "./SubtaskList"
import {
  ProjectDetails,
  PROJECT_COLOURS,
  PROJECTS_KEY,
  ProjectSubtask,
} from "../../shared/types"
import { ButtonWithConfirmation } from "../../shared/controls/ButtonWithConfirmation"
import { getSubtasksKey, useLinkedTasks } from "./utils"
import { EditableTextWithDelete } from "../../shared/controls/EditableTextWithDelete"
import { ArrowToEndIcon } from "../../shared/icons/ArrowToEnd"

type ProjectProps = {
  project: ProjectDetails
  onMoveToEnd: () => void
  onDelete: () => void
}

export function Project({ project, onMoveToEnd, onDelete }: ProjectProps) {
  const [subtasksVisible, setSubtasksVisible] = useState(false)

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
    if (project.status === "in_progress") {
      storageContext.updateItem(PROJECTS_KEY, { ...project, status: "done" })
    } else if (project.status === "done") {
      storageContext.updateItem(PROJECTS_KEY, { ...project, status: "ready" })
    } else {
      storageContext.updateItem(PROJECTS_KEY, {
        ...project,
        status: "in_progress",
      })
    }

    updateLinkedTask({
      status: project.status === "in_progress" ? "finished" : "ready",
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

  const subtasks = Object.values(project.subtasks ?? {})
  const doneSubtasks = subtasks.filter((subtask) => subtask.status === "done")

  return (
    <div className={`project ${project.status}`} style={projectColour}>
      <div className="project-details">
        <EmojiCheckbox
          emoji={project.category}
          isChecked={project.status === "in_progress"}
          onChange={onChangeStatus}
          label={""}
        />
        <EditableTextWithDelete
          label="project"
          value={project.description}
          onChange={(description) => {
            storageContext.updateItem<ProjectDetails>(PROJECTS_KEY, {
              ...project,
              description,
            })
          }}
          onDelete={onDelete}
          style={{
            fontSize: "1em",
            flexGrow: 1,
          }}
        />
        {subtasks.length > 0 && (
          <div className="subtasks-progress">
            {doneSubtasks.length}/{subtasks.length}
          </div>
        )}

        <div className="project-actions">
          <ButtonWithConfirmation
            className="icon ghost project-action-button"
            onClick={onAddToTodo}
            confirmationMessage="Copied!"
          >
            🔗
          </ButtonWithConfirmation>

          <button
            className="icon ghost project-action-button"
            onClick={onMoveToEnd}
          >
            <ArrowToEndIcon width="20px" colour="var(--action-colour)" />
          </button>

          <button
            className={`ghost expand ${subtasksVisible ? "expanded" : ""}`}
            onClick={() => setSubtasksVisible(!subtasksVisible)}
            style={{ marginInlineStart: "auto" }}
          >
            <ChevronDownIcon width="20px" />
          </button>
        </div>
      </div>
      <SubtaskList projectId={project.id} isVisible={subtasksVisible} />
    </div>
  )
}
