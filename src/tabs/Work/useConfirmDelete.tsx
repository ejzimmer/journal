import {
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
} from "@chakra-ui/react"
import { useState, useRef } from "react"
import { Item } from "../../shared/TaskList/types"

export function useConfirmDelete(deleteList: (list: Item) => void) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [list, setList] = useState<Item>()

  return {
    confirmDelete: (list: Item) => {
      setList(list)
      onOpen()
    },
    DeleteListConfirmation: () => {
      const cancelRef = useRef(null)

      const handleClose = () => {
        setList(undefined)
        onClose()
      }

      if (!list) return null

      const handleDelete = () => {
        deleteList(list)
        handleClose()
      }

      return (
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={handleClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogBody
                fontWeight="bold"
                fontSize="20px"
                marginBlock="20px"
              >
                Delete list "{list.description}"?
              </AlertDialogBody>

              <AlertDialogFooter
                gap="10px"
                borderBlockStart="1px solid"
                borderColor="gray.400"
              >
                <Button
                  variant="outline"
                  color="gray.600"
                  ref={cancelRef}
                  onClick={handleClose}
                >
                  No, don't delete
                </Button>
                <Button colorScheme="red" onClick={handleDelete} ml={3}>
                  Yes, delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      )
    },
  }
}
