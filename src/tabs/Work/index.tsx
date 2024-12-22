// start with 3 lists - Today, tomorrow, later
// - can rename lists
// - can add/remove lists
// - normal task functionality with lists
// - at the start of the Day
//   - all done tasks are removed
//   - all not-done tasks in tomorrow are moved to today
// - can add due dates to tasks
// dragging and dropping between parent/child lists - use horizontal position to determine which list to drop into

import { useContext, useEffect, useId, useRef, useState } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import {
  Box,
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
  useDisclosure,
} from "@chakra-ui/react"

const WORK_KEY = "work"

export function Work() {
  const { subscribeToList } = useContext(FirebaseContext)

  useEffect(() => {
    subscribeToList(WORK_KEY, {
      onAdd: (args) => console.log("add", args),
      onChange: (args) => console.log("change", args),
      onDelete: (args) => console.log("delete", args),
    })
  }, [subscribeToList])

  const onAddList = (listName: string) => {
    console.log("adding", listName)
  }

  return (
    <div>
      <NewListDialog onCreate={onAddList} />
    </div>
  )
}

function NewListDialog({ onCreate }: { onCreate: (listName: string) => void }) {
  const listNameRef = useRef<HTMLInputElement>(null)
  const [isSubmitted, setSubmitted] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleCreate = () => {
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
