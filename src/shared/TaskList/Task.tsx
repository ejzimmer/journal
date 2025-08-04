import { useItem } from "../storage/ItemManager"
import { useEffect, useRef, useState } from "react"
import { ItemDescription } from "./ItemDescription"
import { AddTaskForm } from "./AddTaskForm"
import invariant from "tiny-invariant"
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine"
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview"
import { pointerOutsideOfPreview } from "@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview"
import {
  attachClosestEdge,
  type Edge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter"

import "./Task.css"
import { ConfirmationModal } from "../ConfirmationModal"

type TaskProps = {
  id: string
}

type TaskState =
  | {
      type: "idle"
    }
  | {
      type: "preview"
      container: HTMLElement
    }
  | {
      type: "is-dragging"
    }
  | {
      type: "is-dragging-over"
      closestEdge: Edge | null
    }
const idle: TaskState = { type: "idle" }

export function Task({ id }: TaskProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<TaskState>(idle)
  const [isAddingNewTask, setAddingNewTask] = useState(false)
  const {
    item: task,
    isLoading,
    error,
    onChange,
    onDelete,
    onAddItem: onAddTask,
  } = useItem(id)

  useEffect(() => {
    if (!ref.current) return
    const element = ref.current
    invariant(element)

    return combine(
      draggable({
        element,
        getInitialData() {
          return {
            taskId: task?.id,
          }
        },
        onGenerateDragPreview({ nativeSetDragImage }) {
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: pointerOutsideOfPreview({
              x: "16px",
              y: "8px",
            }),
            render({ container }) {
              setState({ type: "preview", container })
            },
          })
        },
        onDragStart() {
          setState({ type: "is-dragging" })
        },
        onDrop() {
          setState(idle)
        },
      }),
      dropTargetForElements({
        element,
        canDrop({ source }) {
          // not allowing dropping on yourself
          if (source.element === element) {
            return false
          }

          return !!source.data.taskId
        },
        getData({ input }) {
          return attachClosestEdge(
            { taskId: task?.id },
            {
              element,
              input,
              allowedEdges: ["top", "bottom"],
            }
          )
        },
        getIsSticky() {
          return true
        },
        onDragEnter({ self }) {
          const closestEdge = extractClosestEdge(self.data)
          setState({ type: "is-dragging-over", closestEdge })
        },
        onDrag({ self }) {
          const closestEdge = extractClosestEdge(self.data)

          // Only need to update react state if nothing has changed.
          // Prevents re-rendering.
          setState((current) => {
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
          setState(idle)
        },
        onDrop() {
          setState(idle)
        },
      })
    )
  }, [task])
  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error || !task) {
    return <div>{error?.message ?? "Unable to load task"}</div>
  }

  return (
    <>
      <div
        style={{ border: "1px solid black", position: "relative" }}
        ref={ref}
      >
        <input
          type="checkbox"
          aria-label={`${task.description}`}
          checked={task.isComplete}
          onChange={() => {
            const isComplete = !task.isComplete
            onChange({ ...task, isComplete })
          }}
        />
        <ItemDescription
          description={task.description}
          onChange={(description) => onChange({ ...task, description })}
          isDone={task.isComplete}
        />
        <button
          className="task-button"
          aria-label={`Add subtask to ${task.description}`}
          onClick={() => setAddingNewTask(true)}
        >
          +
        </button>
        <ConfirmationModal
          message={`Are you sure you want to delete ${task.description}`}
          onConfirm={onDelete}
          trigger={(triggerProps) => (
            <button {...triggerProps} aria-label={`Delete ${task.description}`}>
              🗑️
            </button>
          )}
        />
        {isAddingNewTask && (
          <AddTaskForm
            onSubmit={(arg) => onAddTask(arg.description ?? "foo")}
            onCancel={() => setAddingNewTask(false)}
            labelOptions={[]}
          />
        )}
        {task.items?.length && (
          <div style={{ paddingInlineStart: "3em" }}>
            {/* <TaskList taskIds={task.items} /> */}
          </div>
        )}
        {state.type === "is-dragging-over" && state.closestEdge ? (
          <DropIndicator edge={"top"} />
        ) : null}
      </div>
    </>
  )
}

function DropIndicator({ edge }: { edge: Edge }) {
  return <div className={`drop-indicator ${edge}`} />
}
