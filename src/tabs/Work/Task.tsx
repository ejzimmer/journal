import { Box, Checkbox } from "@chakra-ui/react"
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
import { Tag } from "./Tag"

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
      <Box
        ref={draggableRef}
        display="flex"
        alignItems="baseline"
        opacity={task.isComplete ? 0.4 : 1}
        position="relative"
      >
        <Box
          height="24px"
          alignSelf="center"
          opacity="0.2"
          cursor="grab"
          _hover={{ opacity: 1 }}
          marginInlineEnd="4px"
        >
          <DragIndicator />
        </Box>
        <Checkbox.Root
          aria-label={`${task.description}`}
          checked={task.isComplete}
          onCheckedChange={() => {
            const isComplete = !task.isComplete
            onChange({ ...task, isComplete })
          }}
          colorPalette="gray"
          variant="solid"
          size="sm"
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
        </Checkbox.Root>
        <Box
          display="flex"
          flexGrow="1"
          marginInlineEnd="12px"
          gap="8px"
          alignItems="center"
        >
          <ItemDescription
            description={task.description}
            onChange={(description) => onChange({ ...task, description })}
            isDone={task.isComplete}
          />
          {availableLabels &&
            task.labels?.map((id) => {
              const { text, colour } =
                availableLabels[id as keyof typeof availableLabels]

              return (
                <Tag
                  text={text}
                  colour={colour}
                  onDelete={() =>
                    onChange({
                      ...task,
                      labels: task.labels?.filter((l) => l !== id),
                    })
                  }
                />
              )
            })}
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
        </Box>
        {Menu && <Menu />}
        {draggingState.type === "is-dragging-over" &&
        draggingState.closestEdge ? (
          <DropIndicator edge={draggingState.closestEdge} />
        ) : null}
      </Box>
      {draggingState.type === "preview" &&
        createPortal(<DragPreview task={task} />, draggingState.container)}
    </>
  )
}

function DragPreview({ task }: { task: Item }) {
  return <div>{task.description}</div>
}

function DragIndicator() {
  return (
    <svg fill="black" viewBox="0 0 24 24" height="100%">
      <path d="M8,18 C9.1045695,18 10,18.8954305 10,20 C10,21.1045695 9.1045695,22 8,22 C6.8954305,22 6,21.1045695 6,20 C6,18.8954305 6.8954305,18 8,18 Z M16,18 C17.1045695,18 18,18.8954305 18,20 C18,21.1045695 17.1045695,22 16,22 C14.8954305,22 14,21.1045695 14,20 C14,18.8954305 14.8954305,18 16,18 Z M8,10 C9.1045695,10 10,10.8954305 10,12 C10,13.1045695 9.1045695,14 8,14 C6.8954305,14 6,13.1045695 6,12 C6,10.8954305 6.8954305,10 8,10 Z M16,10 C17.1045695,10 18,10.8954305 18,12 C18,13.1045695 17.1045695,14 16,14 C14.8954305,14 14,13.1045695 14,12 C14,10.8954305 14.8954305,10 16,10 Z M8,2 C9.1045695,2 10,2.8954305 10,4 C10,5.1045695 9.1045695,6 8,6 C6.8954305,6 6,5.1045695 6,4 C6,2.8954305 6.8954305,2 8,2 Z M16,2 C17.1045695,2 18,2.8954305 18,4 C18,5.1045695 17.1045695,6 16,6 C14.8954305,6 14,5.1045695 14,4 C14,2.8954305 14.8954305,2 16,2 Z" />
    </svg>
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
