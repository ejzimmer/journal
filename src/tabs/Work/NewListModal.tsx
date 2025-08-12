import { Modal } from "../../shared/controls/Modal"
import { useRef, useState } from "react"
import { XIcon } from "../../shared/icons/X"

export function NewListModal({
  onCreate,
}: {
  onCreate: (listName: string) => void
}) {
  const [showError, setShowError] = useState(false)
  const listNameRef = useRef<HTMLInputElement>(null)

  const handleCreate = () => {
    const listName = listNameRef.current?.value

    if (listName) {
      onCreate(listName)
    } else {
      setShowError(true)
    }
  }

  return (
    <Modal
      trigger={(props) => (
        <button {...props} className="outline white">
          ➕ Add list
        </button>
      )}
    >
      <form>
        <label>New list name</label>
        <input ref={listNameRef} />
        {showError && (
          <div className="validation-error">
            <XIcon width="18px" />
            List name is required
          </div>
        )}
        <Modal.Footer>
          <Modal.Action onClick={handleCreate}>Create</Modal.Action>
        </Modal.Footer>
      </form>
    </Modal>
  )
}
