import { isBefore, subDays } from "date-fns"
import { AddThisWeekTaskForm } from "./AddThisWeekTaskForm"
import { ThisWeekTask } from "./ThisWeekTask"
import { PARENT_LIST, WeeklyTask } from "./types"
import { useContext, useRef } from "react"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import {
  isDraggable,
  sortByPosition,
} from "../../../shared/drag-and-drop/utils"
import { useDraggableList } from "../../../shared/drag-and-drop/useDraggableList"
import { useDropTarget } from "../../../shared/drag-and-drop/useDropTarget"
import { DraggableListItem } from "../../../shared/drag-and-drop/DraggableListItem"
import {
  draggableTypeKey,
  OrderedListItem,
} from "../../../shared/drag-and-drop/types"
import { DragPreview } from "../DragPreview"
import { DragHandle } from "../../../shared/drag-and-drop/DragHandle"

const moreThanAWeekAgo = (date: number | null) =>
  date && isBefore(date, subDays(new Date(), 7))

export function ThisWeekList() {
  const listRef = useRef<HTMLOListElement>(null)
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }
  const { value } = storageContext.useValue<WeeklyTask>(PARENT_LIST)
  const tasks = sortByPosition(value ? Object.values(value) : [])

  const readyForReset = tasks.filter((task) => {
    const completed = Array.isArray(task.completed)
      ? task.completed
      : (Object.values(task.completed ?? {}) as number[])
    return completed.some(moreThanAWeekAgo)
  })
  readyForReset.forEach((task) =>
    storageContext.updateItem<WeeklyTask>(PARENT_LIST, {
      ...task,
      completed: task.completed?.map((date) =>
        moreThanAWeekAgo(date) ? null : date,
      ),
    }),
  )

  useDropTarget({
    dropTargetRef: listRef,
    canDrop: ({ source }) => isDraggable(source.data),
    getData: () => ({ listId: PARENT_LIST }),
  })

  useDraggableList({
    listId: PARENT_LIST,
    canDropSourceOnTarget: (source) => source[draggableTypeKey] === '"週"',
    getTargetListId: (source) => source.parentId,
    getAxis: () => "vertical",
  })

  return (
    <div className="todo-task-list weekly">
      {tasks.length ? (
        <ol ref={listRef}>
          {tasks.map((task, index) => (
            <DraggableListItem
              key={task.id}
              getData={() => ({
                [draggableTypeKey]: "週",
                id: task.id,
                parentId: PARENT_LIST,
                position: task.position,
              })}
              dragPreview={<DragPreview task={task} />}
              isDroppable={(data) => data[draggableTypeKey] === "週"}
              allowedEdges={["bottom", "top"]}
              className="item"
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
              <ThisWeekTask task={task} />
            </DraggableListItem>
          ))}
        </ol>
      ) : (
        <div>No tasks</div>
      )}
      <AddThisWeekTaskForm />
    </div>
  )
}
