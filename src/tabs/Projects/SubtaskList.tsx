import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useStorageContext } from "../../shared/FirebaseContext"
import { PlusIcon } from "../../shared/icons/Plus"
import { SortIcon } from "../../shared/icons/Sort"
import { Subtask } from "./Subtask"
import { AddSubtaskForm } from "./AddSubtaskForm"
import {
  PROJECTS_KEY,
  ProjectSubtask,
  ProjectDetails,
} from "../../shared/types"
import { getSubtasksKey } from "./utils"
import { DragHandle } from "../../shared/drag-and-drop/DragHandle"
import {
  draggableTypeKey,
  OrderedListItem,
} from "../../shared/drag-and-drop/types"
import { useDropTarget } from "../../shared/drag-and-drop/useDropTarget"
import { isDraggable, sortByPosition } from "../../shared/drag-and-drop/utils"
import { useDraggableList } from "../../shared/drag-and-drop/useDraggableList"
import { useDrawer } from "./useDrawer"

type SubtasksProps = {
  projectId: string
  isVisible: boolean
}

export function SubtaskList({ projectId, isVisible }: SubtasksProps) {
  const [formVisible, setFormVisible] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLOListElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const subtasksKey = getSubtasksKey(projectId)

  const { useValue, addItem, updateList } = useStorageContext()
  const { value, loading } = useValue<Record<string, ProjectSubtask>>(
    subtasksKey,
  )
  const subtasks = useMemo(() => (value ? Object.values(value) : []), [value])
  const { value: project } = useValue<ProjectDetails>(
    `${PROJECTS_KEY}/${projectId}`,
  )
  const isProjectLoaded = Boolean(project)

  const onAddTask = (description: string) => {
    if (!project) return

    addItem<ProjectSubtask>(subtasksKey, {
      description,
      status: "ready",
      category: project.category,
      position: subtasks.length,
    })
  }

  const drawerHeight = useDrawer({
    drawerRef,
    listRef,
    formRef,
    subtasks,
    isProjectLoaded,
    isOpen: isVisible,
  })

  useDropTarget({
    dropTargetRef: listRef,
    canDrop: ({ source }) => isDraggable(source.data),
    getData: () => ({ listId: subtasksKey }),
  })
  useDraggableList({
    listId: subtasksKey,
    canDropSourceOnTarget: (source) => {
      return source[draggableTypeKey] === `subtask-${subtasksKey}`
    },
    getTargetListId: (source) => source.parentId,
    getAxis: () => "vertical",
  })

  const sortedTasks = useMemo(
    () =>
      sortByPosition(
        subtasks.map((task) => ({
          ...task,
          parentId: projectId,
          position: task.position ?? Infinity,
        })),
      ),
    [projectId, subtasks],
  )

  let seenDoneTask = false
  const hasUnsortedDoneTasks = sortedTasks.some((task) => {
    if (task.status === "done") {
      seenDoneTask = true
      return false
    }
    return seenDoneTask
  })

  const onSortDoneToEnd = useCallback(() => {
    const reordered = sortedTasks
      .toSorted(
        (a, b) => Number(a.status === "done") - Number(b.status === "done"),
      )
      .map((task, index) => ({ ...task, position: index }))

    updateList<ProjectSubtask>(
      subtasksKey,
      reordered.map(({ parentId, ...task }) => task),
    )
  }, [sortedTasks, subtasksKey, updateList])

  const hasSortedDoneTasksOnLoad = useRef(false)

  useEffect(() => {
    if (hasSortedDoneTasksOnLoad.current || loading) return
    hasSortedDoneTasksOnLoad.current = true

    if (hasUnsortedDoneTasks) {
      onSortDoneToEnd()
    }
  }, [loading, hasUnsortedDoneTasks, onSortDoneToEnd])

  useEffect(() => {
    const isMissingAPosition = subtasks.some((task) => task.position == null)
    if (isMissingAPosition) {
      updateList<ProjectSubtask>(
        subtasksKey,
        sortedTasks.map(({ parentId, ...task }) => task),
      )
    }
  }, [subtasks, sortedTasks, subtasksKey, updateList])

  if (!project) {
    return null
  }

  return (
    <div
      className={`subtasks-section ${isVisible ? "visible" : ""}`}
      style={{ height: drawerHeight }}
      ref={drawerRef}
    >
      <ol className="subtasks" ref={listRef}>
        {sortedTasks.map((task, index) => (
          <Subtask
            key={task.id}
            path={subtasksKey}
            project={project}
            {...task}
            dragHandle={
              <DragHandle
                list={sortedTasks}
                index={index}
                onReorder={(tasks: OrderedListItem[]) => {
                  updateList(subtasksKey, tasks)
                }}
              />
            }
          />
        ))}
      </ol>
      <div
        ref={formRef}
        style={{
          display: "flex",
          alignItems: "center",
          paddingInlineStart: "12px",
          paddingBlockEnd: "8px",
        }}
      >
        <AddSubtaskForm isFormVisible={formVisible} onAddSubtask={onAddTask} />
        <button
          className={`icon ghost show-form ${formVisible ? "form-visible" : ""}`}
          onClick={() => setFormVisible(!formVisible)}
          style={{ alignSelf: "baseline", marginInlineEnd: "12px" }}
        >
          <PlusIcon width="16px" colour="var(--action-colour)" />
        </button>
        {hasUnsortedDoneTasks && (
          <button
            className="icon ghost sort-done-to-end"
            onClick={onSortDoneToEnd}
            title="Move done subtasks to the end"
            aria-label="Move done subtasks to the end"
            style={{ alignSelf: "baseline" }}
          >
            <SortIcon width="16px" colour="var(--action-colour)" />
          </button>
        )}
      </div>
    </div>
  )
}
