import { Item, Label } from "../../shared/types"
import { EditableDate } from "../../shared/controls/EditableDate"
import { useCallback, useState } from "react"
import { getTaskData, isTask } from "./drag-utils"

import "./TaskList.css"
import { DraggableListItem } from "../../shared/drag-and-drop/DraggableListItem"
import { Destination, Position } from "../../shared/drag-and-drop/types"
import { Checkbox } from "../../shared/controls/Checkbox"
import { DragHandle } from "../../shared/drag-and-drop/DragHandle"
import { XIcon } from "../../shared/icons/X"
import { PlusIcon } from "../../shared/icons/Plus"
import { LabelsControl } from "./LabelsControl"
import { EditableText } from "../../shared/controls/EditableText"

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
  const [addingLabel, setAddingLabel] = useState(false)
  const getData = useCallback(() => getTaskData(task, listId), [task, listId])

  return (
    <DraggableListItem
      getData={getData}
      dragPreview={<DragPreview task={task} />}
      isDroppable={isTask}
      allowedEdges={["top", "bottom"]}
      style={{ display: "flex", alignItems: "center" }}
      className="task"
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
          <EditableText
            onChange={(description) => onChange({ ...task, description })}
            label={`Edit description ${task.description}`}
            className="inline"
            style={{
              textDecoration: task.status === "done" ? "line-through" : "none",
            }}
          >
            {task.description}
          </EditableText>

          {task.labels?.map((label) => (
            <div
              key={label.value}
              className={`label-tag ${label.colour}`}
              style={{ marginBlockStart: "-16px" }}
            >
              {label.value}
              <button
                className="ghost transient"
                onClick={() =>
                  onChange({
                    ...task,
                    labels: task.labels?.filter((l) => l !== label),
                  })
                }
              >
                <XIcon width="16px" />
              </button>
            </div>
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
          {addingLabel ? (
            <LabelsControl
              value={[]}
              onChange={(value) => {
                const labels = new Map<string, Label>(
                  task.labels?.map((label) => [label.value, label])
                )
                value.forEach((label) => {
                  labels.set(label.value, label)
                })
                onChange({
                  ...task,
                  labels: Array.from(labels.values()),
                })
                setAddingLabel(false)
              }}
              label="Add new label"
            />
          ) : (
            <button
              className="add-metadata ghost"
              onClick={() => setAddingLabel(true)}
            >
              <PlusIcon width="16px" />
            </button>
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
