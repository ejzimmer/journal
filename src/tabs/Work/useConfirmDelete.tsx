import { useState, useRef } from "react"
import { Item } from "../../shared/TaskList/types"
import { Modal } from "../../shared/controls/Modal"

export function useConfirmDelete(deleteList: (list: Item) => void) {
  const [list, setList] = useState<Item>()

  return {
    confirmDelete: (list: Item) => {
      setList(list)
    },
    DeleteListConfirmation: () => {
      const cancelRef = useRef(null)

      const handleClose = () => {
        setList(undefined)
      }

      if (!list) return null

      const handleDelete = () => {
        deleteList(list)
        handleClose()
      }

      return (
        <Modal
          trigger={(triggerProps) => <button {...triggerProps}>delete</button>}
        >
          <div
            style={{
              fontWeight: "bold",
              fontSize: "20px",
              marginBlock: "20px",
            }}
          >
            Delete list "{list.description}"?
          </div>

          <div
            style={{
              gap: "10px",
              borderBlockStart: "1px solid",
              borderColor: "gray.400",
            }}
          >
            <button ref={cancelRef} onClick={handleClose}>
              No, don't delete
            </button>
            <Modal.Action onClick={handleDelete}>Yes, delete</Modal.Action>
          </div>
        </Modal>
      )
    },
  }
}
