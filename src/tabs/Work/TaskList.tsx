import {
  useState,
  MouseEvent,
  FocusEvent,
  useRef,
  useMemo,
  useContext,
} from "react"
import { EditableText } from "../../shared/controls/EditableText"
import { AddTaskForm } from "./AddTaskForm"
import { Task } from "./Task/Task"
import { isList, isTask, sortByOrder } from "./drag-utils"

import "./TaskList.css"
import { RubbishBinIcon } from "../../shared/icons/RubbishBin"
import { ModalTriggerProps } from "../../shared/controls/Modal"
import { DragHandle } from "../../shared/drag-and-drop/DragHandle"
import { draggableTypeKey } from "../../shared/drag-and-drop/types"
import { DraggableListItem } from "../../shared/drag-and-drop/DraggableListItem"
import { PostitModal } from "./PostitModal"
import { WorkTask, WORK_KEY } from "./types"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { useDropTarget } from "../../shared/drag-and-drop/useDropTarget"

function getListData(list: WorkTask, parentId: string) {
  return {
    [draggableTypeKey]: "list",
    id: list.id,
    parentId: parentId,
    position: list.position,
  }
}

export function TaskList({
  index,
  listId,
  parentListId,
  menu: Menu,
}: {
  index: number
  listId: string
  parentListId: string
  menu?: React.FC<{ task: WorkTask }>
}) {
  const listRef = useRef<HTMLOListElement>(null)

  const [addTaskFormVisible, setAddTaskFormVisible] = useState(false)
  const showTaskForm = (event: MouseEvent | FocusEvent) => {
    event.stopPropagation()
    if (event.target === listRef.current) {
      setAddTaskFormVisible(true)
    }
  }

  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("missing storage context")
  }

  const { value: lists } = storageContext.useValue<WorkTask>(WORK_KEY)
  const list = lists?.[listId]

  const sortedList = useMemo(
    () => (list?.items ? sortByOrder(Object.values(list.items)) : []),
    [list?.items]
  )

  const dragState = useDropTarget({
    dropTargetRef: listRef,
    canDrop: ({ source }) => isTask(source.data),
    getData: () => (list ? getListData(list, parentListId) : {}),
  })

  if (!list) {
    return
  }

  return (
    <DraggableListItem
      getData={() => getListData(list, parentListId)}
      dragPreview={<DragPreview list={list} />}
      isDroppable={isList}
      allowedEdges={["left", "right"]}
      style={{ display: "flex" }}
      dragHandle={
        <DragHandle
          list={Object.values(lists)}
          index={index}
          onReorder={(reorderedList) => {
            storageContext.updateList(WORK_KEY, reorderedList)
          }}
        />
      }
    >
      <div className="work-task-list">
        <div className="heading">
          <h2>
            <EditableText
              label={`Edit ${list.description} name`}
              onChange={(description) => {
                storageContext.updateItem(WORK_KEY, { ...list, description })
              }}
            >
              {list.description}
            </EditableText>
          </h2>
          <PostitModal
            trigger={(props) => (
              <DeleteButton label={list.description} {...props} />
            )}
            message={`Are you sure you want to delete list ${list.description}?`}
            onConfirm={() => {
              storageContext.deleteItem(WORK_KEY, list)
            }}
          />
        </div>
        <ol
          ref={listRef}
          onClick={showTaskForm}
          onFocus={showTaskForm}
          className={`tasks ${dragState}`}
        >
          {sortedList?.map((item, index) => (
            <Task
              key={item.id}
              path={`${WORK_KEY}/${listId}/items`}
              task={item}
              menu={() => (Menu ? <Menu task={item} /> : null)}
              dragHandle={
                <DragHandle
                  list={sortedList}
                  index={index}
                  onReorder={(reorderedList) =>
                    storageContext.updateList(
                      `${WORK_KEY}/${listId}/items`,
                      reorderedList
                    )
                  }
                />
              }
            />
          ))}
          {addTaskFormVisible && (
            <li style={{ paddingInlineStart: "var(--margin-width)" }}>
              <AddTaskForm
                onSubmit={(newTask) =>
                  storageContext.addItem(`${WORK_KEY}/${listId}/items`, newTask)
                }
                onClose={() => {
                  setAddTaskFormVisible(false)
                }}
              />
            </li>
          )}
        </ol>
      </div>
    </DraggableListItem>
  )
}

function DeleteButton({
  label,
  ...props
}: ModalTriggerProps & { label: string }) {
  const [isHovered, setHovered] = useState(false)

  return (
    <button
      {...props}
      aria-label={`delete list ${label}`}
      className="ghost"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <RubbishBinIcon width="16px" shouldAnimate={isHovered} />
    </button>
  )
}

function DragPreview({ list }: { list: WorkTask }) {
  return (
    <div
      style={{
        border: "1px solid",
        paddingInline: "20px",
        paddingBlockEnd: "10px",
        paddingBlockStart: "5px",
      }}
    >
      <h2>{list.description}</h2>
      <ol style={{ padding: 0, marginInline: "10px" }}>
        {Object.values(list.items ?? {}).map((item) => (
          <li key={item.id}>{item.description}</li>
        ))}
      </ol>
    </div>
  )
}
