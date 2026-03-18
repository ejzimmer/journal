import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { PlusIcon } from "../../shared/icons/Plus"
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

type SubtasksProps = {
  projectId: string
  isVisible: boolean
}

export function SubtaskList({ projectId, isVisible }: SubtasksProps) {
  const [formVisible, setFormVisible] = useState(false)
  const [containerHeight, setContainerHeight] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLOListElement>(null)
  const formContainerRef = useRef<HTMLDivElement>(null)
  const subtasksKey = getSubtasksKey(projectId)

  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }
  const { value } =
    storageContext.useValue<Record<string, ProjectSubtask>>(subtasksKey)
  const subtasks = useMemo(() => (value ? Object.values(value) : []), [value])
  const { value: project } = storageContext.useValue<ProjectDetails>(
    `${PROJECTS_KEY}/${projectId}`,
  )

  const onAddTask = (description: string) => {
    if (!project) return

    storageContext.addItem<ProjectSubtask>(subtasksKey, {
      description,
      status: "ready",
      category: project.category,
    })
  }

  useEffect(() => {
    if (listRef.current && formContainerRef.current) {
      setContainerHeight(
        listRef.current.clientHeight + formContainerRef.current.clientHeight,
      )
    }
  }, [subtasks])

  useDropTarget({
    dropTargetRef: listRef,
    canDrop: ({ source }) => isDraggable(source.data),
    getData: () => ({ listId: subtasksKey }),
  })
  useDraggableList({
    listId: subtasksKey,
    canDropSourceOnTarget: (source) => {
      return source[draggableTypeKey] === "projects-subtask"
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

  return (
    <div
      className={`subtasks-section ${isVisible ? "visible" : ""}`}
      style={{ height: isVisible ? containerHeight : 0 }}
      ref={containerRef}
    >
      <ol className="subtasks" ref={listRef}>
        {sortedTasks.map((task, index) => (
          <Subtask
            key={task.id}
            path={subtasksKey}
            {...task}
            dragHandle={
              <DragHandle
                list={sortedTasks}
                index={index}
                onReorder={(tasks: OrderedListItem[]) => {
                  storageContext.updateList(subtasksKey, tasks)
                }}
              />
            }
          />
        ))}
      </ol>
      <div
        ref={formContainerRef}
        style={{
          display: "flex",
          alignItems: "center",
          paddingInlineStart: "12px",
        }}
      >
        <AddSubtaskForm isFormVisible={formVisible} onAddSubtask={onAddTask} />
        <button
          className={`icon ghost show-form ${formVisible ? "form-visible" : ""}`}
          onClick={() => setFormVisible(!formVisible)}
        >
          <PlusIcon width="16px" colour="var(--action-colour)" />
        </button>
      </div>
    </div>
  )
}
