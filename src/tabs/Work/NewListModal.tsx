import { Modal } from "../../shared/controls/Modal"
import { useRef } from "react"

export function NewListModal({
  onCreate,
}: {
  onCreate: (listName: string) => void
}) {
  const listNameRef = useRef<HTMLInputElement>(null)

  const handleCreate = () => {
    const listName = listNameRef.current?.value

    if (listName) {
      onCreate(listName)
    }
  }

  return (
    <Modal trigger={(props) => <button {...props}>➕ Add list</button>}>
      <form>
        <label>
          <b>New list name</b>
        </label>
        <input ref={listNameRef} />
        <div>List name is required</div>
        <Modal.Action onAction={handleCreate}>Create</Modal.Action>
      </form>
    </Modal>
  )
}
