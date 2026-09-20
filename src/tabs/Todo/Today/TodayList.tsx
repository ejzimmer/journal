import { TodayTask } from "./TodayTask"

import { AddTodayTaskForm } from "./AddTodayTaskForm"
import { DailyTask, DAILY_KEY } from "../../../shared/types"
import { useRef } from "react"
import { useStorageContext } from "../../../shared/FirebaseContext"
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

export function TodayList() {
  const listRef = useRef<HTMLOListElement>(null)
  const { useValue, updateList, updateItem } = useStorageContext()
  const { value } = useValue<Record<string, DailyTask>>(DAILY_KEY)
  const tasks = value ? sortByPosition(Object.values(value)) : []

  useDropTarget({
    dropTargetRef: listRef,
    canDrop: ({ source }) => isDraggable(source.data),
    getData: () => ({ listId: DAILY_KEY }),
  })
  useDraggableList({
    listId: DAILY_KEY,
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
              className={`today-task item status-${task.status} type-${task.type}`}
              getData={() => ({
                [draggableTypeKey]: "日",
                id: task.id,
                parentId: DAILY_KEY,
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
                    updateList(DAILY_KEY, tasks)
                  }}
                />
              }
            >
              <TodayTask
                task={task}
                onChange={(task: DailyTask) => {
                  updateItem<DailyTask>(DAILY_KEY, task)
                }}
              />
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
