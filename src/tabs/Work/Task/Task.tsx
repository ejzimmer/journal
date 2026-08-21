import { ReactElement } from "react"
import { isTask } from "../drag-utils"

import { DraggableListItem } from "../../../shared/drag-and-drop/DraggableListItem"
import { draggableTypeKey } from "../../../shared/drag-and-drop/types"
import { Checkbox } from "../../../shared/controls/Checkbox"
import { WorkTask, WORK_KEY } from "../types"
import { useWorkStorage } from "../WorkStorageContext"
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
  listId: string
  dragHandle: ReactElement
}

export function Task({ task, listId, dragHandle }: TaskProps) {
  const {
    updateTask,
    deleteTask,
    getList,
    removeLabelFromTask,
    markLabelUnusedIfOrphaned,
    reviveLabel,
  } = useWorkStorage()
  const list = getList(listId)

  const onChangeWorktree = (newWorktree?: Worktree) => {
    if (newWorktree) {
      updateTask(listId, { ...task, worktree: newWorktree })
    } else {
      const { worktree, ...taskWithoutWorktree } = task
      updateTask(listId, taskWithoutWorktree)
    }
  }

  return (
    <DraggableListItem
      getData={() => ({
        [draggableTypeKey]: "task",
        id: task.id,
        parentId: `${WORK_KEY}/${listId}/items`,
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
            updateTask(listId, {
              ...task,
              status,
              lastStatusUpdate: new Date().getTime(),
            })
            // Done tasks don't count towards a label's usage, so becoming
            // done can orphan a label; becoming active again can revive one
            // that was pending removal.
            const onLabel = isChecked ? markLabelUnusedIfOrphaned : reviveLabel
            task.labelIds?.forEach((id) => onLabel(id))
          }}
          aria-label={`${task.description}`}
        />
      </div>
      <div className="task-content">
        <EditableText
          label={`Edit description ${task.description}`}
          value={task.description}
          onChange={(description) => {
            updateTask(listId, {
              ...task,
              description,
            })
          }}
          onDelete={() => deleteTask(listId, task)}
          className="inline"
          style={{
            textDecoration: task.status === "done" ? "line-through" : "none",
          }}
        />
        <Subtasks
          subtasks={task.subtasks}
          listId={listId}
          taskId={task.id}
        />
        <Labels
          labelIds={task.labelIds}
          onRemoveLabel={(id) => list && removeLabelFromTask(id, task, list)}
        />

        <DueDate
          dueDate={task.dueDate}
          onChange={(date) => {
            const { dueDate, ...taskWithoutDueDate } = task
            if (date) {
              updateTask(listId, {
                ...task,
                dueDate: date,
              })
            } else {
              updateTask(listId, taskWithoutDueDate)
            }
          }}
        />

        <UpdateLabels
          labelIds={task.labelIds}
          onUpdateLabels={(labelIds) => {
            updateTask(listId, { ...task, labelIds })
          }}
        />

        {!task.worktree && <AddWorktree onChange={onChangeWorktree} />}
        <AddSubtask subtasks={task.subtasks} listId={listId} taskId={task.id} />
      </div>
    </DraggableListItem>
  )
}

function DragPreview({ task }: { task: WorkTask }) {
  return <div>{task.description}</div>
}
