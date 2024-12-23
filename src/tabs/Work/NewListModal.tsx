import {
  useDisclosure,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  ModalFooter,
} from "@chakra-ui/react"
import { useRef, useState, FormEvent } from "react"

export function NewListModal({
  onCreate,
}: {
  onCreate: (listName: string) => void
}) {
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
