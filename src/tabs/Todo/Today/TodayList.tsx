import { TodayTask } from "./TodayTask"

import { AddTodayTaskForm } from "./AddTodayTaskForm"
import { isBefore, startOfDay } from "date-fns"
import { DailyTask, DAILY_KEY } from "../../../shared/types"
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
import { DayData, Habit, HABITS, isHabit } from "../../ThisYear/Days/types"
import { formatDate } from "../../../shared/utils"
import { PATH as dailyPath } from "../../ThisYear/Days/Days"

const updatedYesterday = (task: DailyTask, status: DailyTask["status"]) =>
  task.status === status && isBefore(task.lastCompleted, startOfDay(new Date()))

export function TodayList() {
  const listRef = useRef<HTMLOListElement>(null)
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }
  const { value } = storageContext.useValue<DailyTask>(DAILY_KEY)
  const tasks = sortByPosition(value ? Object.values(value) : [])

  const { day, month } = formatDate(new Date())
  const { value: today } = storageContext.useValue<DayData>(
    `${dailyPath}/${day}${month}`,
  )

  const { finishedTasks, unfinishedTasks } = tasks.reduce(
    (sortedTasks: Record<string, DailyTask[]>, task) => {
      if (updatedYesterday(task, "finished")) {
        sortedTasks.finishedTasks.push(task)
      } else {
        sortedTasks.unfinishedTasks.push(task)
      }
      return sortedTasks
    },
    {
      finishedTasks: [],
      unfinishedTasks: [],
    },
  )

  finishedTasks.forEach((task) =>
    storageContext.deleteItem<DailyTask>(DAILY_KEY, task),
  )
  if (finishedTasks.length) {
    storageContext.updateList(
      DAILY_KEY,
      unfinishedTasks.map((task, index) => ({ ...task, position: index })),
    )
  }

  const readyToReset = tasks.filter((task) => updatedYesterday(task, "done"))
  readyToReset.forEach((task) =>
    storageContext.updateItem<DailyTask>(DAILY_KEY, {
      ...task,
      status: "ready",
      lastCompleted: new Date().getTime(),
    }),
  )

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
              className={`today-task item status-${task.status}`}
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
                    storageContext.updateList(DAILY_KEY, tasks)
                  }}
                />
              }
            >
              <TodayTask
                task={task}
                onChange={(task: DailyTask) => {
                  storageContext.updateItem<DailyTask>(DAILY_KEY, task)

                  if (!isHabit(task.category.emoji)) {
                    return
                  }

                  const otherTasksInCategory = tasks.filter(
                    (t) =>
                      t.id !== task.id &&
                      t.category.emoji === task.category.emoji,
                  )
                  const allTasksDone =
                    otherTasksInCategory.every((t) => t.status === "done") &&
                    task.status === "done"

                  const habits =
                    today?.habits ??
                    Object.fromEntries(HABITS.map((habit) => [habit, false]))
                  storageContext.updateItem<DayData>(dailyPath, {
                    id: `${day}${month}`,
                    habits: {
                      ...habits,
                      [task.category.emoji]: allTasksDone,
                    } as Record<Habit, boolean>,
                  })
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
