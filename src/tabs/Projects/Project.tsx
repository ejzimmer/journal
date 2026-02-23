import {
  CSSProperties,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { EditableText } from "../../shared/controls/EditableText"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { TickIcon } from "../../shared/icons/Tick"
import { COLOURS, KEY, ProjectDetails, Task } from "./types"

import "./Project.css"
import { EmojiCheckbox } from "../../shared/controls/EmojiCheckbox"
import { ConfirmationModalDialog } from "../../shared/controls/ConfirmationModal"
import { PlusIcon } from "../../shared/icons/Plus"
import { ChevronDownIcon } from "../../shared/icons/ChevronDown"
import { Checkbox } from "../../shared/controls/Checkbox"

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
      project.category in COLOURS ? COLOURS[project.category] : "white",
  } as CSSProperties

  const onChangeStatus = () => {
    if (project.status === "ready") {
      storageContext.updateItem(KEY, { ...project, status: "in_progress" })
    } else if (project.status === "in_progress") {
      storageContext.updateItem(KEY, { ...project, status: "done" })
    } else {
      storageContext.updateItem(KEY, { ...project, status: "ready" })
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
            storageContext.updateItem<ProjectDetails>(KEY, {
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
          onConfirm={() => storageContext.deleteItem(KEY, project)}
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
      <Subtasks projectId={project.id} isVisible={subtasksVisible} />
    </li>
  )
}

type SubtasksProps = {
  projectId: string
  isVisible: boolean
}

function Subtasks({ projectId, isVisible }: SubtasksProps) {
  const [formVisible, setFormVisible] = useState(false)
  const [containerHeight, setContainerHeight] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const formContainerRef = useRef<HTMLDivElement>(null)
  const subtasksKey = `${KEY}/${projectId}/subtasks`

  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }
  const { value } = storageContext.useValue<Task>(subtasksKey)
  const subtasks = useMemo(() => (value ? Object.values(value) : []), [value])

  const onUpdateTask = (task: Task) =>
    storageContext.updateItem<Task>(subtasksKey, task)

  const onDeleteTask = (task: Task) =>
    storageContext.deleteItem<Task>(subtasksKey, task)

  const onAddTask = (description: string) => {
    storageContext.addItem<Task>(subtasksKey, {
      description,
      status: "ready",
    })
  }

  useEffect(() => {
    if (listRef.current && formContainerRef.current) {
      setContainerHeight(
        listRef.current.clientHeight + formContainerRef.current.clientHeight,
      )
    }
  }, [subtasks])

  return (
    <div
      className={`subtasks-section ${isVisible ? "visible" : ""}`}
      style={{ height: isVisible ? containerHeight : 0 }}
      ref={containerRef}
    >
      <ul className="subtasks" ref={listRef}>
        {subtasks.map((task) => (
          <Subtask
            key={task.id}
            {...task}
            onUpdate={onUpdateTask}
            onDelete={() => onDeleteTask(task)}
          />
        ))}
      </ul>
      <div
        ref={formContainerRef}
        style={{ display: "flex", alignItems: "center" }}
      >
        <AddSubtaskForm isFormVisible={formVisible} onAddSubtask={onAddTask} />
        <button
          className={`icon ghost show-form ${formVisible ? "form-visible" : ""}`}
          onClick={() => setFormVisible(!formVisible)}
        >
          <PlusIcon width="16px" colour="var(--action-colour)" />
        </button>
      </div>
    </div>
  )
}

type SubtaskProps = Task & {
  onUpdate: (task: Task) => void
  onDelete: () => void
}

function Subtask({ onUpdate, onDelete, ...task }: SubtaskProps) {
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false)

  return (
    <li className="subtask">
      <Checkbox
        isChecked={task.status === "done"}
        onChange={() => {
          onUpdate({
            ...task,
            status: task.status === "done" ? "ready" : "done",
          })
        }}
        aria-label={`${task.description} ${task.status}`}
      />
      <EditableText
        label="project"
        onChange={(description) => {
          if (!description) {
            setConfirmDeleteModalOpen(true)
            return
          }
          onUpdate({ ...task, description })
        }}
        style={{ fontSize: "1em" }}
      >
        {task.description}
      </EditableText>
      <ConfirmationModalDialog
        message={`Are you sure you want to delete ${task.description}`}
        onConfirm={onDelete}
        isOpen={confirmDeleteModalOpen}
      />
    </li>
  )
}

type AddSubtaskFormProps = {
  isFormVisible: boolean
  onAddSubtask: (description: string) => void
}

function AddSubtaskForm({ isFormVisible, onAddSubtask }: AddSubtaskFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const formWidthRef = useRef(0)
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (formRef.current) {
      formWidthRef.current = formRef.current.scrollWidth + 30
    }
  }, [])

  return (
    <form
      ref={formRef}
      className={`add-subtask-form ${isFormVisible ? "visible" : ""}`}
      style={{ width: isFormVisible ? formWidthRef.current : 0 }}
      onSubmit={(event) => {
        event.preventDefault()

        onAddSubtask(description)
        setDescription("")
      }}
    >
      <input
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <button className="ghost">
        <TickIcon width="16px" colour="var(--action-colour)" />
      </button>
    </form>
  )
}
