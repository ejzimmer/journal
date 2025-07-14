import { useItem } from "../storage/ItemManager"
import { DeleteTaskButton } from "./DeleteTaskButton"
import { TaskButton } from "./TaskButton"
import { useEffect, useRef, useState } from "react"
import { ItemDescription } from "./ItemDescription"
import { AddTaskForm } from "./AddTaskForm"
import { Box } from "@chakra-ui/react"
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
      <Box border="1px solid black" position="relative" ref={ref}>
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
        <TaskButton
          aria-label={`Add subtask to ${task.description}`}
          onClick={() => setAddingNewTask(true)}
        >
          +
        </TaskButton>
        <DeleteTaskButton
          taskDescription={task.description}
          onDelete={onDelete}
        />
        {isAddingNewTask && (
          <AddTaskForm
            onSubmit={(arg) => onAddTask(arg.description ?? "foo")}
            onCancel={() => setAddingNewTask(false)}
            labelOptions={[]}
          />
        )}
        {task.items?.length && (
          <Box paddingInlineStart="3em">
            {/* <TaskList taskIds={task.items} /> */}
          </Box>
        )}
        {state.type === "is-dragging-over" && state.closestEdge ? (
          <DropIndicator edge={"top"} />
        ) : null}
      </Box>
    </>
  )
}

const lineOffset = "-5px"
const strokeSize = 2
const terminalRadius = 4
const terminalDiameter = terminalRadius * 2
const offsetToAlignTerminalWithLine = (strokeSize - terminalDiameter) / 2

function DropIndicator({ edge }: { edge: Edge }) {
  return (
    <Box
      position="absolute"
      backgroundColor="blue.500"
      pointerEvents="none"
      height={`${strokeSize}px`}
      left={`${terminalRadius}px`}
      right={0}
      top={edge === "top" ? lineOffset : undefined}
      bottom={edge === "bottom" ? lineOffset : undefined}
      css={{
        "&::before": {
          content: '""',
          position: "absolute",
          top:
            edge === "top" ? `${offsetToAlignTerminalWithLine}px` : undefined,
          bottom:
            edge === "bottom"
              ? `${offsetToAlignTerminalWithLine}px`
              : undefined,
          left: `-${terminalDiameter}px`,
          width: `${terminalDiameter}px`,
          height: `${terminalDiameter}px`,
          border: `${strokeSize}px solid`,
          borderColor: "blue.500",
          borderRadius: "1000px",
        },
      }}
    />
  )
}
