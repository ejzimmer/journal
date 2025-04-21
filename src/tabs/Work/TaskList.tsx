import { Box, Heading } from "@chakra-ui/react"
import { useState, MouseEvent, FocusEvent, useRef, useEffect } from "react"
import { EditableText } from "../../shared/controls/EditableText"
import { AddTaskForm } from "../../shared/TaskList/AddTaskForm"
import { Item, Label } from "../../shared/TaskList/types"
import { chakra } from "@chakra-ui/react"
import { Task } from "./Task"
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { reorderWithEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge"
import { isTask } from "./drag-utils"

export function TaskList({
  list,
  labels,
  onChangeListName,
  onAddTask,
  onChangeTask,
  onReorderTasks,
  menu: Menu,
}: {
  list: Item
  labels?: Record<string, Label>
  onChangeListName: (name: string) => void
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

  return (
    <Box
      display="flex"
      flexDirection="column"
      minWidth="300px"
      minHeight="316px"
      cursor="text"
      sx={{
        "--margin-width": "30px",
        "--margin-colour": "hsl(330 60% 85%)",
      }}
      paddingInlineStart="var(--margin-width)"
      background="linear-gradient(to right, transparent, transparent var(--margin-width), var(--margin-colour) var(--margin-width), var(--margin-colour) calc(var(--margin-width) + 2px), transparent calc(var(--margin-width) + 2px))"
    >
      <Heading
        as="h2"
        fontSize="20px"
        borderBottom="2px solid hsl(200 90% 80%)"
        marginInlineStart="calc(var(--margin-width) * -1)"
        paddingInlineStart="calc(var(--margin-width) + 8px)"
      >
        <EditableText
          label={`Edit ${list.description} name`}
          onChange={onChangeListName}
        >
          {list.description}
        </EditableText>
      </Heading>
      <chakra.ul
        ref={listRef}
        onClick={showTaskForm}
        onFocus={showTaskForm}
        flexGrow={1}
        lineHeight="1"
        listStyleType="none"
        sx={{
          "--line-colour": "hsl(200 90% 80%)",
          "--line-height": "33px",
        }}
        fontFamily="'Shadows Into Light', sans-serif"
        fontSize="24px"
        marginInlineStart="calc(var(--margin-width) * -1)"
        paddingInlineStart="calc(var(--margin-width) + 8px)"
        background="repeating-linear-gradient(transparent, transparent var(--line-height), var(--line-colour) var(--line-height), var(--line-colour) calc(var(--line-height) + 1px), transparent calc(var(--line-height) + 1px))"
      >
        {sortedList?.map((item, index) => (
          <chakra.li key={item.id} _last={{ marginBlockEnd: "40px" }}>
            <Task
              task={item}
              availableLabels={labels}
              onChange={onChangeTask}
              menu={() => (Menu ? <Menu task={item} /> : null)}
            />
          </chakra.li>
        ))}
        {addTaskFormVisible && (
          <chakra.li marginBlockStart="12px">
            <AddTaskForm
              onSubmit={onAddTask}
              onCancel={() => {
                setAddTaskFormVisible(false)
              }}
              labelOptions={labels ? Object.values(labels) : []}
            />
          </chakra.li>
        )}
      </chakra.ul>
    </Box>
  )
}
