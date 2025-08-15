import { ItemDescription } from "../../shared/TaskList/ItemDescription"
import { Item, Label } from "../../shared/TaskList/types"
import { EditableDate } from "./EditableDate"
import { useEffect, useRef, useState } from "react"
import invariant from "tiny-invariant"
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine"
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview"
import { pointerOutsideOfPreview } from "@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview"
import {
  attachClosestEdge,
  type Edge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { createPortal } from "react-dom"
import { getTaskData, isTask } from "./drag-utils"

import "./TaskList.css"
import { DragHandleIcon } from "../../shared/icons/DragHandle"

type DraggingState =
  | { type: "idle" }
  | { type: "preview"; container: HTMLElement }
  | { type: "is-dragging-over"; closestEdge: Edge | null }
const IDLE: DraggingState = { type: "idle" }

export function Task({
  task,
  availableLabels,
  onChange,
  menu: Menu,
}: {
  task: Item
  availableLabels?: Record<string, Label>
  onChange: (task: Item) => void
  menu?: React.FC
}) {
  const draggableRef = useRef<HTMLDivElement | null>(null)
  const [draggingState, setDraggingState] = useState<DraggingState>(IDLE)

  useEffect(() => {
    if (!draggableRef.current) return

    const element = draggableRef.current
    invariant(element)
    return combine(
      draggable({
        element,
        getInitialData() {
          return getTaskData(task)
        },
        onGenerateDragPreview({ nativeSetDragImage }) {
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: pointerOutsideOfPreview({
              x: "16px",
              y: "8px",
            }),
            render({ container }) {
              setDraggingState({ type: "preview", container })
            },
          })
        },
        onDrop() {
          setDraggingState(IDLE)
        },
      }),
      dropTargetForElements({
        element,
        canDrop({ source }) {
          // not allowing dropping on yourself
          if (source.element === element) {
            return false
          }

          // only allowing tasks to be dropped on me
          return isTask(source.data)
        },
        getData({ input }) {
          const data = getTaskData(task)
          return attachClosestEdge(data, {
            element,
            input,
            allowedEdges: ["top", "bottom"],
          })
        },
        getIsSticky() {
          return true
        },
        onDragEnter({ self }) {
          const closestEdge = extractClosestEdge(self.data)
          setDraggingState({ type: "is-dragging-over", closestEdge })
        },
        onDrag({ self }) {
          const closestEdge = extractClosestEdge(self.data)

          // Only need to update react state if something has changed.
          // Prevents re-rendering.
          setDraggingState((current) => {
            if (
              current.type === "is-dragging-over" &&
              current.closestEdge === closestEdge
            ) {
              return current
            }
            return { type: "is-dragging-over", closestEdge }
          })
        },
        onDragLeave() {
          setDraggingState(IDLE)
        },
        onDrop() {
          setDraggingState(IDLE)
        },
      })
    )
  }, [task])

  return (
    <>
      <div
        ref={draggableRef}
        style={{
          display: "flex",
          alignItems: "baseline",
          opacity: task.status === "done" ? 0.4 : 1,
          position: "relative",
        }}
      >
        <div
          style={{
            height: "24px",
            alignSelf: "center",
            opacity: "0.2",
            cursor: "grab",
            // _hover:{{ opacity: 1 }},
            marginInlineEnd: "4px",
          }}
        >
          <DragHandleIcon />
        </div>
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
        {draggingState.type === "is-dragging-over" &&
        draggingState.closestEdge ? (
          <DropIndicator edge={draggingState.closestEdge} />
        ) : null}
      </div>
      {draggingState.type === "preview" &&
        createPortal(<DragPreview task={task} />, draggingState.container)}
    </>
  )
}

function DragPreview({ task }: { task: Item }) {
  return <div>{task.description}</div>
}

function DropIndicator({ edge }: { edge: Edge }) {
  return <div className={`drop-indicator ${edge}`} />
}
