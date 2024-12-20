import { Task } from "./Task"
import { useFetchItem } from "../storage/ItemManager"
import { useEffect } from "react"
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"

type TaskListProps = {
  taskIds: string[]
  onChangeAllComplete?: (isComplete: boolean) => void
}

export function TaskList({ taskIds, onChangeAllComplete }: TaskListProps) {
  const getItem = useFetchItem()

  if (onChangeAllComplete) {
    Promise.all(taskIds.map(getItem)).then((tasks) => {
      onChangeAllComplete(tasks.every((task) => task.isComplete))
    })
  }

  useEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        console.log("can monitor", source)
        return !!source.data.taskId
      },
      onDrop({ location, source }) {
        console.log("location", location)
        console.log("source", source)
        const target = location.current.dropTargets[0]
        if (!target) {
          return
        }

        const sourceData = source.data
        const targetData = target.data

        // if (!isTaskData(sourceData) || !isTaskData(targetData)) {
        //   return
        // }

        // const indexOfSource = tasks.findIndex(
        //   (task) => task.id === sourceData.taskId
        // )
        // const indexOfTarget = tasks.findIndex(
        //   (task) => task.id === targetData.taskId
        // )

        // if (indexOfTarget < 0 || indexOfSource < 0) {
        //   return
        // }

        // const closestEdgeOfTarget = extractClosestEdge(targetData)

        // Using `flushSync` so we can query the DOM straight after this line
        // flushSync(() => {
        //   setTasks(
        //     reorderWithEdge({
        //       list: tasks,
        //       startIndex: indexOfSource,
        //       indexOfTarget,
        //       closestEdgeOfTarget,
        //       axis: "vertical",
        //     })
        //   )
        // })
        // Being simple and just querying for the task after the drop.
        // We could use react context to register the element in a lookup,
        // and then we could retrieve that element after the drop and use
        // `triggerPostMoveFlash`. But this gets the job done.
        // const element = document.querySelector(
        //   `[data-task-id="${sourceData.taskId}"]`
        // )
        // if (element instanceof HTMLElement) {
        //   triggerPostMoveFlash(element)
        // }
      },
    })
  }, [])

  return (
    <>
      {taskIds.length > 0 ? (
        <ul>
          {taskIds.map((id) => (
            <li key={id}>
              <Task id={id} />
            </li>
          ))}
        </ul>
      ) : (
        <div>No tasks</div>
      )}
    </>
  )
}
