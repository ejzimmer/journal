import { ReactElement, useContext } from "react"
import { Checkbox } from "../../shared/controls/Checkbox"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { ProjectSubtask } from "../../shared/types"
import { ButtonWithConfirmation } from "../../shared/controls/ButtonWithConfirmation"
import { useLinkedTasks } from "./utils"
import { EditableTextWithDelete } from "../../shared/controls/EditableTextWithDelete"
import { DraggableListItem } from "../../shared/drag-and-drop/DraggableListItem"
import { draggableTypeKey } from "../../shared/drag-and-drop/types"

type SubtaskProps = ProjectSubtask & {
  path: string
  dragHandle: ReactElement
}

export function Subtask({ path, dragHandle, ...task }: SubtaskProps) {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const {
    linkedTask,
    createLinkedTask: createDailyTask,
    updateLinkedTask,
  } = useLinkedTasks(task.linkedId)

  const updateTask = (task: ProjectSubtask) => {
    storageContext.updateItem<ProjectSubtask>(path, task)
  }

  const onAddToTodo = () => {
    const linkedId = createDailyTask({
      description: task.description,
      category: task.category,
      linkedTaskId: `${path}/${task.id}`,
    })

    if (linkedId) updateTask({ ...task, linkedId })
    return !!linkedId
  }

  const handleChange = () => {
    const status = task.status === "done" ? "ready" : "done"
    updateTask({ ...task, status })

    updateLinkedTask({
      status,
      lastCompleted: new Date().getTime(),
    })
  }

  return (
    <DraggableListItem
      getData={() => ({
        [draggableTypeKey]: "project-subtask",
        id: task.id,
        parentId: path,
        position: task.position ?? Infinity,
      })}
      dragPreview={<DragPreview task={task} />}
      isDroppable={(data) =>
        draggableTypeKey in data && data[draggableTypeKey] === "project-subtask"
      }
      allowedEdges={["top", "bottom"]}
      dragHandle={dragHandle}
      className="subtask"
    >
      <Checkbox
        isChecked={task.status === "done"}
        onChange={handleChange}
        aria-label={`${task.description} ${task.status}`}
      />
      <EditableTextWithDelete
        label="project"
        value={task.description}
        onChange={(description) => {
          updateTask({ ...task, description })
        }}
        onDelete={() => storageContext.deleteItem(path, task)}
        style={{ fontSize: "1em" }}
      />
      <ButtonWithConfirmation
        className={`icon ghost copy-button ${linkedTask ? "linked" : ""}`}
        onClick={onAddToTodo}
        confirmationMessage="Copied!"
      >
        <span style={{ fontSize: ".7em" }}>🔗</span>
      </ButtonWithConfirmation>
    </DraggableListItem>
  )
}

function DragPreview({ task }: { task: ProjectSubtask }) {
  return <div>{task.description}</div>
}
