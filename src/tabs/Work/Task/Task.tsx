import { ReactElement, useContext } from "react"
import { isTask } from "../drag-utils"

import { DraggableListItem } from "../../../shared/drag-and-drop/DraggableListItem"
import { draggableTypeKey } from "../../../shared/drag-and-drop/types"
import { Checkbox } from "../../../shared/controls/Checkbox"
import { WorkTask } from "../types"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { Labels } from "./Labels"
import { UpdateLabels } from "./UpdateLabels"
import { DueDate } from "./DueDate"
import { EditableText } from "../../../shared/controls/EditableText"
import { WorktreeStamp } from "./WorktreeStamp"
import { AddWorktree } from "./AddWorktree"
import { Worktree } from "../types"
import { Subtasks } from "./Subtasks"
import { AddSubtask } from "./AddSubtask"

type TaskProps = {
  task: WorkTask
  path: string
  dragHandle: ReactElement
}

export function Task({ task, path, dragHandle }: TaskProps) {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("missing firebase context")
  }

  const onChangeWorktree = (newWorktree?: Worktree) => {
    if (newWorktree) {
      storageContext.updateItem(path, { ...task, worktree: newWorktree })
    } else {
      const { worktree, ...taskWithoutWorktree } = task
      storageContext.updateItem(path, taskWithoutWorktree)
    }
  }

  const subtasksPath = `${path}/${task.id}/subtasks`

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
      {task.worktree && (
        <div className="worktree-marker">
          <WorktreeStamp worktree={task.worktree} onChange={onChangeWorktree} />
        </div>
      )}
      <div className="checkbox-container">
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
          label={`Edit description ${task.description}`}
          value={task.description}
          onChange={(description) => {
            storageContext.updateItem(path, {
              ...task,
              description,
            })
          }}
          onDelete={() => storageContext.deleteItem(path, task)}
          className="inline"
          style={{
            textDecoration: task.status === "done" ? "line-through" : "none",
          }}
        />
        <Subtasks subtasks={task.subtasks} path={subtasksPath} />
        <Labels
          labelIds={task.labelIds}
          onRemoveLabel={(id) => {
            storageContext.updateItem(path, {
              ...task,
              labelIds: task.labelIds?.filter((existing) => existing !== id),
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
          labelIds={task.labelIds}
          onUpdateLabels={(labelIds) => {
            storageContext.updateItem(path, {
              ...task,
              labelIds,
            })
          }}
        />

        {!task.worktree && <AddWorktree onChange={onChangeWorktree} />}
        <AddSubtask subtasks={task.subtasks} path={subtasksPath} />
      </div>
    </DraggableListItem>
  )
}

function DragPreview({ task }: { task: WorkTask }) {
  return <div>{task.description}</div>
}
