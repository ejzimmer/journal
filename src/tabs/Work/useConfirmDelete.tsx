import { Dialog, Button, Portal, Theme } from "@chakra-ui/react"
import { useState, useRef } from "react"
import { Item } from "../../shared/TaskList/types"

export function useConfirmDelete(deleteList: (list: Item) => void) {
  const [isOpen, setIsOpen] = useState(false)
  const [list, setList] = useState<Item>()

  return {
    confirmDelete: (list: Item) => {
      setList(list)
      setIsOpen(true)
    },
    DeleteListConfirmation: () => {
      const cancelRef = useRef(null)

      const handleClose = () => {
        setList(undefined)
        setIsOpen(false)
      }

      if (!list) return null

      const handleDelete = () => {
        deleteList(list)
        handleClose()
      }

      return (
        <Dialog.Root
          open={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={handleClose}
          role="alertdialog"
        >
          <Portal>
            <Theme appearance="light">
              <Dialog.Backdrop>
                <Dialog.Content>
                  <Dialog.Body
                    fontWeight="bold"
                    fontSize="20px"
                    marginBlock="20px"
                  >
                    Delete list "{list.description}"?
                  </Dialog.Body>

                  <Dialog.Footer
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
                  </Dialog.Footer>
                </Dialog.Content>
              </Dialog.Backdrop>
            </Theme>
          </Portal>
        </Dialog.Root>
      )
    },
  }
}
