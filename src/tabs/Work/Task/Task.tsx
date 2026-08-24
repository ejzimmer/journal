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
  const { updateTask, deleteTask, addLabel, removeLabel } = useWorkStorage()
  const hasLabels = (task.labelIds?.length ?? 0) > 0

  const onChangeWorktree = (newWorktree?: Worktree) => {
    if (newWorktree) {
      updateTask(listId, { ...task, worktree: newWorktree })
    } else {
      const { worktree, ...taskWithoutWorktree } = task
      updateTask(listId, taskWithoutWorktree)
    }
  }

  const onChangeDueDate = (date?: number) => {
    const { dueDate, ...taskWithoutDueDate } = task
    if (date) {
      updateTask(listId, { ...task, dueDate: date })
    } else {
      updateTask(listId, taskWithoutDueDate)
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
      <div className="worktree-marker">
        {task.worktree ? (
          <WorktreeStamp worktree={task.worktree} onChange={onChangeWorktree} />
        ) : (
          <AddWorktree onChange={onChangeWorktree} />
        )}
      </div>
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
        {hasLabels && (
          <Labels
            labelIds={task.labelIds}
            onRemoveLabel={(id) => removeLabel(id, task)}
          />
        )}

        {!hasLabels && (
          <DueDate dueDate={task.dueDate} onChange={onChangeDueDate} />
        )}

        <UpdateLabels onAddLabel={(label) => addLabel(label, task)} />

        {hasLabels && (
          <DueDate dueDate={task.dueDate} onChange={onChangeDueDate} />
        )}

        <AddSubtask listId={listId} taskId={task.id} />
      </div>
    </DraggableListItem>
  )
}

function DragPreview({ task }: { task: WorkTask }) {
  return <div>{task.description}</div>
}
