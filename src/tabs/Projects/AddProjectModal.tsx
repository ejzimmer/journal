import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
} from "@chakra-ui/react"
import { COLOURS } from "../../shared/TodoList/types"
import { useRef } from "react"
import { ProjectMetadata } from "./Project"

type Props = {
  isOpen: boolean
  onSave: (project: ProjectMetadata) => void
  onClose: () => void
}

export function AddProjectModal({ isOpen, onClose, onSave }: Props) {
  const nameRef = useRef<HTMLInputElement>(null)
  const typeRef = useRef<HTMLSelectElement>(null)

  const handleSave = () => {
    const name = nameRef.current?.value
    const category = typeRef.current?.value as keyof typeof COLOURS

    if (name && category) {
      onSave({ name, category, tasks: [] })
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>New Project</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <label>
            Project name
            <Input ref={nameRef} />
          </label>
          <div>Project name is mandatory</div>
          <label>
            Project type
            <Select ref={typeRef}>
              {Object.keys(COLOURS).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </label>
          <div>Project type is mandatory</div>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button variant="ghost" onClick={handleSave}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
