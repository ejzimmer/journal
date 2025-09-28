import { ItemDescription } from "../../shared/TaskList/ItemDescription"
import { Item } from "../../shared/TaskList/types"
import { EditableDate } from "./EditableDate"
import { useCallback } from "react"
import { getTaskData, isTask } from "./drag-utils"

import "./TaskList.css"
import { DraggableListItem } from "../../shared/drag-and-drop/DraggableListItem"
import { Destination, Position } from "../../shared/drag-and-drop/types"
import { Checkbox } from "../../shared/controls/Checkbox"
import { DragHandle } from "../../shared/drag-and-drop/DragHandle"

type TaskProps = {
  task: Item
  onChange: (task: Item) => void
  position: Position
  onChangePosition: (destination: Destination) => void
  menu: React.FC
  listId: string
}

export function Task({
  task,
  onChange,
  position,
  onChangePosition,
  menu: Menu,
  listId,
}: TaskProps) {
  const getData = useCallback(() => getTaskData(task, listId), [task, listId])

  return (
    <DraggableListItem
      getData={getData}
      dragPreview={<DragPreview task={task} />}
      isDroppable={isTask}
      allowedEdges={["top", "bottom"]}
      style={{ display: "flex", alignItems: "center" }}
    >
      <DragHandle position={position} onChangePosition={onChangePosition} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          opacity: task.status === "done" ? 0.4 : 1,
          fontSize: "1.7rem",
          width: "100%",
        }}
      >
        <div style={{ alignSelf: "start", marginBlockStart: "4px" }}>
          <Checkbox
            isChecked={task.status === "done"}
            onChange={(isChecked) => {
              const status = isChecked ? "done" : "not_started"
              onChange({ ...task, status })
            }}
            aria-label={`${task.description}`}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexGrow: "1",
            marginInline: "12px",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <ItemDescription
            description={task.description}
            onChange={(description) => onChange({ ...task, description })}
            isDone={task.status === "done"}
          />
          {task.labels?.map((label) => (
            <div key={label.value}>{label.value}</div>
          ))}
          {task.dueDate && (
            <div
              style={{
                color: "var(--error-colour)",
                border: "2px solid",
                fontSize: "0.9em",
                fontWeight: "bold",
              }}
            >
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
            </div>
          )}
        </div>
        <Menu />
      </div>
    </DraggableListItem>
  )
}

function DragPreview({ task }: { task: Item }) {
  return <div>{task.description}</div>
}
