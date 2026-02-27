import { isBefore, subDays } from "date-fns"
import { AddThisWeekTaskForm } from "./AddThisWeekTaskForm"
import { ThisWeekTask } from "./ThisWeekTask"
import { WEEKLY_KEY, WeeklyTask } from "../../../shared/types"
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

export function ThisWeekList() {
  const moreThanAWeekAgo = (date: number | null) =>
    date && isBefore(date, subDays(new Date(), 7))
  console.log("more than a week ago", moreThanAWeekAgo)

  const listRef = useRef<HTMLOListElement>(null)
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }
  const { value } = storageContext.useValue<WeeklyTask>(WEEKLY_KEY)
  const tasks = sortByPosition(value ? Object.values(value) : [])

  const readyForReset = tasks.filter((task) => {
    const completed = Array.isArray(task.completed)
      ? task.completed
      : (Object.values(task.completed ?? {}) as number[])
    console.log(
      task.description,
      task.completed?.map((d) => d && new Date(d)),
      "needs updating",
      completed.some(moreThanAWeekAgo),
    )
    return completed.some(moreThanAWeekAgo)
  })
  readyForReset.forEach((task) => {
    storageContext.updateItem<WeeklyTask>(WEEKLY_KEY, {
      ...task,
      completed: task.completed?.map((date) =>
        moreThanAWeekAgo(date) ? null : date,
      ),
    })
  })

  useDropTarget({
    dropTargetRef: listRef,
    canDrop: ({ source }) => isDraggable(source.data),
    getData: () => ({ listId: WEEKLY_KEY }),
  })

  useDraggableList({
    listId: WEEKLY_KEY,
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
                parentId: WEEKLY_KEY,
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
                    storageContext.updateList(WEEKLY_KEY, tasks)
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
