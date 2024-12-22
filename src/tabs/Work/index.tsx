// start with 3 lists - Today, tomorrow, later
// - can rename lists
// - can add/remove lists
// - normal task functionality with lists
// - at the start of the Day
//   - all done tasks are removed
//   - all not-done tasks in tomorrow are moved to today
// - can add due dates to tasks
// dragging and dropping between parent/child lists - use horizontal position to determine which list to drop into

import { FormEvent, useContext, useEffect, useRef, useState } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  Stack,
  useDisclosure,
} from "@chakra-ui/react"

const WORK_KEY = "work"

export function Work() {
  const { addItemToList, useValue } = useContext(FirebaseContext)
  const { value: lists, loading: listsLoading } = useValue(WORK_KEY)

  const onAddList = (listName: string) => {
    addItemToList(WORK_KEY, { description: listName })
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
    <div>
      {Object.entries(lists).map(([id, { description }]) => (
        <div key={id}>{description}</div>
      ))}
      <NewListDialog onCreate={onAddList} />
    </div>
  )
}

function NewListDialog({ onCreate }: { onCreate: (listName: string) => void }) {
  const listNameRef = useRef<HTMLInputElement>(null)
  const [isSubmitted, setSubmitted] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleCreate = (event: FormEvent) => {
    event.preventDefault()
    const listName = listNameRef.current?.value
    if (!listName) {
      setSubmitted(true)
      return
    }
    onCreate(listName)
    handleClose()
  }

  const handleClose = () => {
    setSubmitted(false)
    onClose()
  }

  return (
    <>
      <Button variant="outline" onClick={onOpen}>
        ➕ Add list
      </Button>

      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody>
            <form onSubmit={handleCreate}>
              <FormControl
                isInvalid={isSubmitted && !listNameRef.current?.value}
              >
                <FormLabel fontWeight="bold">New list name</FormLabel>
                <Input onChange={() => setSubmitted(false)} ref={listNameRef} />
                <FormErrorMessage>List name is required</FormErrorMessage>
              </FormControl>
            </form>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={handleCreate}>
              Create
            </Button>
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
