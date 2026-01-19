import { TodayTask } from "./TodayTask"

import { AddTodayTaskForm } from "./AddTodayTaskForm"
import { isBefore, startOfDay } from "date-fns"
import { DailyTask, PARENT_LIST } from "./types"
import { useContext, useRef } from "react"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { DraggableListItem } from "../../../shared/drag-and-drop/DraggableListItem"
import {
  draggableTypeKey,
  OrderedListItem,
} from "../../../shared/drag-and-drop/types"
import { DragPreview } from "../DragPreview"
import { DragHandle } from "../../../shared/drag-and-drop/DragHandle"
import { useDropTarget } from "../../../shared/drag-and-drop/useDropTarget"
import { useDraggableList } from "../../../shared/drag-and-drop/useDraggableList"
import {
  isDraggable,
  sortByPosition,
} from "../../../shared/drag-and-drop/utils"

const updatedYesterday = (task: DailyTask, status: DailyTask["status"]) =>
  task.status === status && isBefore(task.lastCompleted, startOfDay(new Date()))

export function TodayList() {
  const listRef = useRef<HTMLOListElement>(null)
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }
  const { value } = storageContext.useValue<DailyTask>(PARENT_LIST)
  const tasks = sortByPosition(value ? Object.values(value) : [])

  const finishedTasks = tasks.filter((task) =>
    updatedYesterday(task, "finished")
  )
  finishedTasks.forEach((task) =>
    storageContext.deleteItem<DailyTask>(PARENT_LIST, task)
  )

  const readyToReset = tasks.filter((task) => updatedYesterday(task, "done"))
  readyToReset.forEach((task) =>
    storageContext.updateItem<DailyTask>(PARENT_LIST, {
      ...task,
      status: "ready",
      lastCompleted: new Date().getTime(),
    })
  )

  useDropTarget({
    dropTargetRef: listRef,
    canDrop: ({ source }) => isDraggable(source.data),
    getData: () => ({ listId: PARENT_LIST }),
  })
  useDraggableList({
    listId: PARENT_LIST,
    canDropSourceOnTarget: (source) => {
      return source[draggableTypeKey] === "日"
    },
    getTargetListId: (source) => source.parentId,
    getAxis: () => "vertical",
  })

  return (
    <div className="todo-task-list">
      {tasks.length ? (
        <ol ref={listRef}>
          {tasks.map((task, index) => (
            <DraggableListItem
              key={task.id}
              className={`today-task item status-${task.status}`}
              getData={() => ({
                [draggableTypeKey]: "日",
                id: task.id,
                parentId: PARENT_LIST,
                position: task.position,
              })}
              dragPreview={<DragPreview task={task} />}
              isDroppable={(data) => data[draggableTypeKey] === "日"}
              allowedEdges={["bottom", "top"]}
              dragHandle={
                <DragHandle
                  list={tasks}
                  index={index}
                  onReorder={(tasks: OrderedListItem[]) => {
                    storageContext.updateList(PARENT_LIST, tasks)
                  }}
                />
              }
            >
              <TodayTask task={task} />
            </DraggableListItem>
          ))}
        </ol>
      ) : (
        <div>No tasks for today</div>
      )}
      <AddTodayTaskForm />
    </div>
  )
}
