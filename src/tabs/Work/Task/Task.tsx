import { EditableDate } from "../../../shared/controls/EditableDate"
import { ReactElement, useContext, useState } from "react"
import { isTask } from "../drag-utils"

import { DraggableListItem } from "../../../shared/drag-and-drop/DraggableListItem"
import { draggableTypeKey } from "../../../shared/drag-and-drop/types"
import { Checkbox } from "../../../shared/controls/Checkbox"
import { EditableText } from "../../../shared/controls/EditableText"
import { WorkTask } from "../types"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { Labels } from "./Labels"
import { UpdateLabels } from "./UpdateLabels"
import { DueDate } from "./DueDate"
import { PostitModalDialog } from "../PostitModal"

type TaskProps = {
  task: WorkTask
  menu: React.FC
  path: string
  dragHandle: ReactElement
}

export function Task({ task, menu: Menu, path, dragHandle }: TaskProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("missing firebase context")
  }

  return (
    <DraggableListItem
      getData={() => ({
        [draggableTypeKey]: "task",
        id: task.id,
        parentId: path,
        position: task.position,
      })}
      dragPreview={<DragPreview task={task} />}
      isDroppable={isTask}
      allowedEdges={["top", "bottom"]}
      className={`task status-${task.status}`}
      dragHandle={dragHandle}
    >
      <div style={{ alignSelf: "start", marginBlockStart: "4px" }}>
        <Checkbox
          isChecked={task.status === "done"}
          onChange={(isChecked) => {
            const status = isChecked ? "done" : "not_started"
            storageContext.updateItem(path, {
              ...task,
              status,
              lastStatusUpdate: new Date().getTime(),
            })
          }}
          aria-label={`${task.description}`}
        />
      </div>
      <div className="task-content">
        <EditableText
          onChange={(description) => {
            if (description) {
              storageContext.updateItem(path, {
                ...task,
                description,
              })
            } else {
              setDeleteModalOpen(true)
            }
          }}
          label={`Edit description ${task.description}`}
          className="inline"
          style={{
            textDecoration: task.status === "done" ? "line-through" : "none",
          }}
        >
          {task.description}
        </EditableText>
        {deleteModalOpen && (
          <PostitModalDialog
            isOpen={deleteModalOpen}
            message={`Are you sure you want to delete ${task.description}?`}
            onConfirm={() => storageContext.deleteItem(path, task)}
            onCancel={() => setDeleteModalOpen(false)}
          />
        )}

        <Labels
          labels={task.labels}
          onRemoveLabel={(label) => {
            storageContext.updateItem(path, {
              ...task,
              labels: task.labels?.filter((l) => l !== label),
            })
          }}
        />

        <DueDate
          dueDate={task.dueDate}
          onChange={(date) => {
            const { dueDate, ...taskWithoutDueDate } = task
            if (date) {
              storageContext.updateItem(path, {
                ...task,
                dueDate: date,
              })
            } else {
              storageContext.updateItem(path, taskWithoutDueDate)
            }
          }}
        />

        <UpdateLabels
          labels={task.labels}
          onUpdateLabels={(labels) => {
            storageContext.updateItem(path, {
              ...task,
              labels: Array.from(labels.values()),
            })
          }}
        />
      </div>
      <Menu />
    </DraggableListItem>
  )
}

function DragPreview({ task }: { task: WorkTask }) {
  return <div>{task.description}</div>
}
