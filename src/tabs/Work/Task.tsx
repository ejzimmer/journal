import { ItemDescription } from "../../shared/TaskList/ItemDescription"
import { Item, Label } from "../../shared/TaskList/types"
import { EditableDate } from "./EditableDate"
import { useCallback } from "react"
import { getTaskData, isTask } from "./drag-utils"

import "./TaskList.css"
import { DraggableListItem } from "../../shared/drag-and-drop/DraggableListItem"
import { Destination, Position } from "../../shared/drag-and-drop/types"

type TaskProps = {
  task: Item
  onChange: (task: Item) => void
  position: Position
  onChangePosition: (destination: Destination) => void
  menu?: React.FC
}

export function Task({
  task,
  onChange,
  position,
  onChangePosition,
  menu: Menu,
}: TaskProps) {
  const getData = useCallback(() => getTaskData(task), [task])

  return (
    <DraggableListItem
      position={position}
      onChangePosition={onChangePosition}
      getData={getData}
      dragPreview={<DragPreview task={task} />}
      canDrop={isTask}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          opacity: task.status === "done" ? 0.4 : 1,
          position: "relative",
        }}
      >
        <input
          type="checkbox"
          aria-label={`${task.description}`}
          checked={task.status === "done"}
          onChange={() => {
            const status = task.status === "done" ? "not_started" : "done"
            onChange({ ...task, status })
          }}
        />
        <div
          style={{
            display: "flex",
            flexGrow: "1",
            marginInlineEnd: "12px",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <ItemDescription
            description={task.description}
            onChange={(description) => onChange({ ...task, description })}
            isDone={task.status === "done"}
          />
          {task.dueDate && (
            <EditableDate
              value={task.dueDate}
              onChange={(date) => {
                const { dueDate, ...taskWithoutDueDate } = task
                if (date) {
                  onChange({ ...task, dueDate: date })
                } else {
                  onChange(taskWithoutDueDate)
                }
              }}
            />
          )}
        </div>
        {Menu && <Menu />}
      </div>
    </DraggableListItem>
  )
}

function DragPreview({ task }: { task: Item }) {
  return <div>{task.description}</div>
}
