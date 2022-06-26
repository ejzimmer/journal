import { Table, Tbody, Tr } from "@chakra-ui/react"
import { eachDayOfInterval, endOfISOWeek, startOfISOWeek } from "date-fns"
import { useCallback, useContext } from "react"
import { Footer } from "./Footer"
import { Habit } from "./Habit"
import { Header } from "./Header"
import { HabitRecord } from "./types"
import { FirebaseContext } from "../../shared/FirebaseContext"
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd"
import { resortList } from "../../shared/utilities"

const TRACK_KEY = "track"

export function Track() {
  const {
    addItemToList,
    updateItemInList,
    deleteItemFromList,
    updateList,
    useValue,
  } = useContext(FirebaseContext)

  const { value } = useValue(TRACK_KEY)
  const habits =
    value &&
    value.sort((a: HabitRecord, b: HabitRecord) => a.position - b.position)

  const startDate = startOfISOWeek(new Date())
  const endOfWeek = endOfISOWeek(startDate)
  const days = eachDayOfInterval({ start: startDate, end: endOfWeek })

  const addHabit = (habitName: string) => {
    if (habitName) {
      addItemToList(TRACK_KEY, { name: habitName, days: [] })
    }
  }

  const updateHabit = (habit: HabitRecord) => {
    updateItemInList(TRACK_KEY, habit)
  }

  const deleteHabit = (habit: HabitRecord) => {
    deleteItemFromList(TRACK_KEY, habit)
  }

  const onReorder = useCallback(
    (list: HabitRecord[]) => {
      updateList(TRACK_KEY, list)
    },
    [updateList]
  )

  const onDragEnd = (dropResult: DropResult) => {
    resortList(dropResult, habits, onReorder)
  }

  return (
    <Table size="sm" width="max-content">
      <Header days={days} />
      {habits && (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="track">
            {(provided) => (
              <Tbody {...provided.droppableProps} ref={provided.innerRef}>
                {habits.map((habit: HabitRecord, index: number) => (
                  <Draggable
                    key={habit.id}
                    draggableId={habit.id}
                    index={index}
                  >
                    {(provided) => (
                      <Tr
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <Habit
                          habit={habit}
                          days={days}
                          onChange={updateHabit}
                          onDelete={deleteHabit}
                        />
                      </Tr>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Tbody>
            )}
          </Droppable>
        </DragDropContext>
      )}
      <Footer addHabit={addHabit} />
    </Table>
  )
}
