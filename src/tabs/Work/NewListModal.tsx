import {
  Button,
  Dialog,
  Field,
  IconButton,
  Input,
  Portal,
  Theme,
} from "@chakra-ui/react"
import { useRef, FormEvent, useState } from "react"
import { FiX } from "react-icons/fi"

export function NewListModal({
  onCreate,
}: {
  onCreate: (listName: string) => void
}) {
  const listNameRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleCreate = (event: FormEvent) => {
    event.preventDefault()
    const listName = listNameRef.current?.value

    if (listName) {
      onCreate(listName)
      setIsOpen(false)
    }
  }

  return (
    <>
      <Dialog.Root
        open={isOpen}
        onOpenChange={(event: { open: boolean }) => setIsOpen(event.open)}
        size="md"
      >
        <Dialog.Trigger asChild>
          <Button variant="ghost" size="sm">
            ➕ Add list
          </Button>
        </Dialog.Trigger>
        <Portal>
          <Theme appearance="light">
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.CloseTrigger asChild>
                    <IconButton variant="ghost">
                      <FiX />
                    </IconButton>
                  </Dialog.CloseTrigger>
                </Dialog.Header>
                <Dialog.Body>
                  <form onSubmit={handleCreate}>
                    <Field.Root>
                      <Field.Label>
                        <b>New list name</b>
                      </Field.Label>
                      <Input ref={listNameRef} />
                      <Field.ErrorText>List name is required</Field.ErrorText>
                    </Field.Root>
                  </form>
                </Dialog.Body>
                <Dialog.Footer>
                  <Dialog.ActionTrigger asChild>
                    <Button variant="ghost" size="xs">
                      Cancel
                    </Button>
                  </Dialog.ActionTrigger>
                  <Button
                    mr={3}
                    onClick={handleCreate}
                    size="xs"
                    colorPalette="green"
                  >
                    Create
                  </Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Theme>
        </Portal>
      </Dialog.Root>
    </>
  )
}
