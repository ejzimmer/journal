// start with 3 lists - Today, tomorrow, later
// - can rename lists
// - can add/remove lists
// - normal task functionality with lists
// - at the start of the Day
//   - all done tasks are removed
//   - all not-done tasks in tomorrow are moved to today
// - can add due dates to tasks
// dragging and dropping between parent/child lists - use horizontal position to determine which list to drop into

import { useContext } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { Box, Heading, HStack, Skeleton, Stack } from "@chakra-ui/react"
import { EditableText } from "../../shared/controls/EditableText"
import { Item } from "../../shared/TaskList/types"
import { NewListModal } from "./NewListModal"

const WORK_KEY = "work"

export function Work() {
  const { addItemToList, useValue, updateItemInList } =
    useContext(FirebaseContext)
  const { value: lists, loading: listsLoading } = useValue(WORK_KEY)

  const onAddList = (listName: string) => {
    addItemToList(WORK_KEY, { description: listName })
  }
  const onUpdateListName = (newName: string, list: Item) => {
    if (!newName) {
    }
    updateItemInList(WORK_KEY, { ...list, description: newName })
  }

  if (listsLoading) {
    return (
      <Stack maxWidth="400px">
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
      </Stack>
    )
  }

  if (!lists) {
    return <div>Uh oh. Could not load lists.</div>
  }

  return (
    <HStack wrap="wrap">
      {Object.entries(lists).map(([id, list]) => (
        <Box minWidth="200px" minHeight="600px">
          <Heading as="h2" fontSize="20px">
            <EditableText
              key={id}
              label={`Edit ${list.description} name`}
              onChange={(value) => onUpdateListName(value, list)}
            >
              {list.description}
            </EditableText>
          </Heading>
        </Box>
      ))}
      <NewListModal onCreate={onAddList} />
    </HStack>
  )
}
