import { CSSProperties, useState } from "react"
import { useStorageContext } from "../../shared/FirebaseContext"

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
import { ArrowToEndIcon } from "../../shared/icons/ArrowToEnd"
import { EditableText } from "../../shared/controls/EditableText"

type ProjectProps = {
  project: ProjectDetails
  onMoveToEnd: () => void
  onDelete: () => void
}

const OPEN_PROJECTS_STORAGE_KEY = "openProjectIds"

function getOpenProjectIds(): Set<string> {
  try {
    const stored = localStorage.getItem(OPEN_PROJECTS_STORAGE_KEY)
    return new Set(stored ? JSON.parse(stored) : [])
  } catch {
    return new Set()
  }
}

function setProjectOpen(projectId: string, isOpen: boolean) {
  const openProjectIds = getOpenProjectIds()
  if (isOpen) {
    openProjectIds.add(projectId)
  } else {
    openProjectIds.delete(projectId)
  }
  try {
    localStorage.setItem(
      OPEN_PROJECTS_STORAGE_KEY,
      JSON.stringify([...openProjectIds]),
    )
  } catch {
    // Ignore storage errors, e.g. private browsing or a full quota
  }
}

export function Project({ project, onMoveToEnd, onDelete }: ProjectProps) {
  const [subtasksVisible, setSubtasksVisible] = useState(() =>
    getOpenProjectIds().has(project.id),
  )
  const [hasOpenedSubtasks, setHasOpenedSubtasks] = useState(subtasksVisible)

  const status = project.status ?? "ready"

  const { updateItem } = useStorageContext()

  const { createLinkedTask: createDailyTask, updateLinkedTask } =
    useLinkedTasks(project.linkedTaskId)

  const projectColour = {
    "--project-colour":
      project.category in PROJECT_COLOURS
        ? PROJECT_COLOURS[project.category]
        : "white",
  } as CSSProperties

  const onChangeStatus = () => {
    if (status === "in_progress") {
      updateItem(PROJECTS_KEY, { ...project, status: "done" })
    } else if (status === "done") {
      updateItem(PROJECTS_KEY, { ...project, status: "ready" })
    } else {
      updateItem(PROJECTS_KEY, {
        ...project,
        status: "in_progress",
      })
    }

    updateLinkedTask({
      status: status === "in_progress" ? "finished" : "ready",
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
          updateItem<ProjectSubtask>(getSubtasksKey(project.id), {
            ...task,
            linkedId,
          })
        }
      })
    } else {
      const linkedTaskId = createDailyTask({
        description: project.description,
        category: project.category,
        linkedTaskId: `${PROJECTS_KEY}/${project.id}`,
      })

      if (linkedTaskId) {
        updateItem<ProjectDetails>(PROJECTS_KEY, {
          ...project,
          linkedTaskId,
        })
      }
    }
    return true
  }

  const subtasks = Object.values(project.subtasks ?? {})
  const doneSubtasks = subtasks.filter((subtask) => subtask.status === "done")

  if (status === "ready" && doneSubtasks.length > 0) {
    updateItem<ProjectDetails>(PROJECTS_KEY, {
      ...project,
      status: "in_progress",
    })
  }

  const expandButton = (
    <button
      className={`ghost expand ${subtasksVisible ? "expanded" : ""}`}
      onClick={() => {
        const nextVisible = !subtasksVisible
        setSubtasksVisible(nextVisible)
        setHasOpenedSubtasks(true)
        setProjectOpen(project.id, nextVisible)
      }}
      aria-label="Show subtasks"
    >
      <ChevronDownIcon width="20px" />
    </button>
  )

  return (
    <div className={`project ${status}`} style={projectColour}>
      <div className="project-details">
        <div className="project-main-row">
          <EmojiCheckbox
            emoji={project.category}
            isChecked={status === "done"}
            useTickForDone
            onChange={onChangeStatus}
            label={""}
          />
          <EditableText
            className="project-name"
            label="project"
            value={project.description}
            onChange={(description) => {
              updateItem<ProjectDetails>(PROJECTS_KEY, {
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
          {status !== "in_progress" && expandButton}
        </div>

        {status === "in_progress" && (
          <div className="project-meta-row">
            <SubtaskProgress subtasks={subtasks} doneSubtasks={doneSubtasks} />
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

              {expandButton}
            </div>
          </div>
        )}
      </div>
      {hasOpenedSubtasks && (
        <SubtaskList projectId={project.id} isVisible={subtasksVisible} />
      )}
    </div>
  )
}

type SubtaskProgressProps = {
  subtasks: ProjectSubtask[]
  doneSubtasks: ProjectSubtask[]
}

function SubtaskProgress({ subtasks, doneSubtasks }: SubtaskProgressProps) {
  if (subtasks.length === 0) return null

  const donePercentage = (doneSubtasks.length / subtasks.length) * 100

  return (
    <div className="subtasks-progress">
      <div className="subtasks-progress-track" aria-hidden="true">
        <div
          className="subtasks-progress-fill"
          style={{ width: `${donePercentage}%` }}
        />
      </div>
      <span className="subtasks-progress-count">
        {doneSubtasks.length} of {subtasks.length}
      </span>
    </div>
  )
}
