import { useState, MouseEvent, FocusEvent, useRef, useEffect } from "react"
import { EditableText } from "../../shared/controls/EditableText"
import { AddTaskForm } from "../../shared/TaskList/AddTaskForm"
import { Item, Label } from "../../shared/TaskList/types"
import { Task } from "./Task"
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import {
  Edge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { reorderWithEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge"
import { isTask } from "./drag-utils"

import "./TaskList.css"
import { ConfirmationModal } from "../../shared/controls/ConfirmationModal"
import { Destination } from "../../shared/drag-and-drop/types"

const containerStyle = {
  "--margin-width": "30px",
  "--margin-colour": "hsl(330 60% 85%)",
  display: "flex",
  flexDirection: "column",
  minWidth: "300px",
  minHeight: "316px",
  cursor: "text",
  paddingInlineStart: "var(--margin-width)",
  background:
    "linear-gradient(to right, transparent, transparent var(--margin-width), var(--margin-colour) var(--margin-width), var(--margin-colour) calc(var(--margin-width) + 2px), transparent calc(var(--margin-width) + 2px))",
} as React.CSSProperties

const listStyle = {
  "--line-colour": "hsl(200 90% 80%)",
  "--line-height": "33px",
  flexGrow: 1,
  lineHeight: "1",
  listStyleType: "none",
  fontFamily: "'Shadows Into Light', sans-serif",
  fontSize: "24px",
  marginInlineStart: "calc(var(--margin-width) * -1)",
  paddingInlineStart: "calc(var(--margin-width) + 8px)",
  background:
    "repeating-linear-gradient(transparent, transparent var(--line-height), var(--line-colour) var(--line-height), var(--line-colour) calc(var(--line-height) + 1px), transparent calc(var(--line-height) + 1px))",
} as React.CSSProperties

export function TaskList({
  list,
  labels,
  onChangeListName,
  onDelete,
  onAddTask,
  onChangeTask,
  onReorderTasks,
  menu: Menu,
}: {
  list: Item
  labels?: Record<string, Label>
  onChangeListName: (name: string) => void
  onDelete: () => void
  onAddTask: (
    task: Omit<Partial<Item>, "labels"> & { labels?: Label[] }
  ) => void
  onChangeTask: (task: Item) => void
  onReorderTasks: (tasks: Item[]) => void
  menu?: React.FC<{ task: Item }>
}) {
  const listRef = useRef<HTMLUListElement>(null)
  const [addTaskFormVisible, setAddTaskFormVisible] = useState(false)

  const showTaskForm = (event: MouseEvent | FocusEvent) => {
    event.stopPropagation()
    if (event.target === listRef.current) {
      setAddTaskFormVisible(true)
    }
  }

  const sortedList =
    list.items &&
    Object.values(list.items).toSorted(
      (a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)
    )

  useEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        return isTask(source.data)
      },
      onDrop({ location, source }) {
        const target = location.current.dropTargets[0]
        if (!target || !sortedList) {
          return
        }

        const sourceData = source.data
        const targetData = target.data

        if (!isTask(sourceData) || !isTask(targetData)) {
          return
        }

        const indexOfSource = sortedList.findIndex(
          (task) => task.id === sourceData.taskId
        )
        const indexOfTarget = sortedList.findIndex(
          (task) => task.id === targetData.taskId
        )

        if (indexOfTarget < 0 || indexOfSource < 0) {
          return
        }

        const closestEdgeOfTarget = extractClosestEdge(targetData)
        onReorderTasks(
          reorderWithEdge({
            list: sortedList,
            startIndex: indexOfSource,
            indexOfTarget,
            closestEdgeOfTarget,
            axis: "vertical",
          })
        )
      },
    })
  }, [list, onReorderTasks, sortedList])

  function onChangePosition(originIndex: number, destination: Destination) {
    if (!sortedList) return

    const getTarget = (): {
      indexOfTarget: number
      closestEdgeOfTarget: Edge
    } => {
      switch (destination) {
        case "start":
          return { indexOfTarget: 0, closestEdgeOfTarget: "top" }
        case "previous":
          return { indexOfTarget: originIndex - 1, closestEdgeOfTarget: "top" }
        case "next":
          return {
            indexOfTarget: originIndex + 1,
            closestEdgeOfTarget: "bottom",
          }
        case "end":
          return {
            indexOfTarget: sortedList.length - 1,
            closestEdgeOfTarget: "bottom",
          }
      }
    }

    onReorderTasks(
      reorderWithEdge({
        list: sortedList,
        startIndex: originIndex,
        ...getTarget(),
        axis: "vertical",
      })
    )
  }

  return (
    <div style={containerStyle}>
      <h2
        style={{
          fontSize: "20px",
          borderBottom: "2px solid hsl(200 90% 80%)",
          marginInlineStart: "calc(var(--margin-width) * -1)",
          paddingInlineStart: "calc(var(--margin-width) + 8px)",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <EditableText
          label={`Edit ${list.description} name`}
          onChange={onChangeListName}
        >
          {list.description}
        </EditableText>
        <ConfirmationModal
          trigger={(props) => (
            <button
              {...props}
              aria-label={`delete list ${list.description}`}
              className="delete-button ghost"
            >
              🗑️
            </button>
          )}
          message={`Are you sure you want to delete list ${list.description}?`}
          confirmButtonText="Yes, delete"
          onConfirm={onDelete}
        />
      </h2>
      <ul
        ref={listRef}
        onClick={showTaskForm}
        onFocus={showTaskForm}
        style={listStyle}
      >
        {sortedList?.map((item, index) => (
          <li className="task" key={item.id}>
            <Task
              position={getPosition(index, sortedList.length)}
              onChangePosition={(destination) =>
                onChangePosition(index, destination)
              }
              task={item}
              onChange={onChangeTask}
              menu={() => (Menu ? <Menu task={item} /> : null)}
            />
          </li>
        ))}
        {addTaskFormVisible && (
          <li style={{ marginBlockStart: "12px" }}>
            <AddTaskForm
              onSubmit={onAddTask}
              onCancel={() => {
                setAddTaskFormVisible(false)
              }}
              labelOptions={labels ? Object.values(labels) : []}
            />
          </li>
        )}
      </ul>
    </div>
  )
}

function getPosition(index: number, listLength: number) {
  if (index === 0) {
    return "start"
  }
  if (index === listLength - 1) {
    return "end"
  }

  return "middle"
}
