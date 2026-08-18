import { useRef, useState } from "react"
import { FormModal } from "../../shared/controls/FormModal"
import { FormControl } from "../../shared/controls/FormControl"
import { LabelsControl } from "./LabelsControl"

export function NewListModal({
  onCreate,
}: {
  onCreate: (listName: string, labelIds?: string[]) => void
}) {
  const [showError, setShowError] = useState(false)
  const [listName, setListName] = useState("")
  const [labelIds, setLabelIds] = useState<string[]>([])

  const listNameRef = useRef<HTMLInputElement>(null)

  const onChange = (value: string) => {
    setListName(value)
    if (value) {
      setShowError(false)
    }
  }

  const handleCreate = () => {
    if (!listName) {
      setShowError(true)
      listNameRef.current?.focus()
      return false
    }

    onCreate(listName, labelIds)
    setListName("")
    setLabelIds([])
    return true
  }

  return (
    <FormModal
      trigger={(props) => (
        <button {...props} className="outline white">
          ➕ Add list
        </button>
      )}
      onSubmit={handleCreate}
      submitButtonText="Create"
      onClose={() => {
        setShowError(false)
      }}
    >
      <FormControl
        label="New list name"
        ref={listNameRef}
        value={listName}
        onChange={onChange}
        errors={showError && ["List name is required"]}
      />
      <LabelsControl
        value={labelIds}
        onChange={setLabelIds}
        label="Label"
        isMulti={false}
      />
    </FormModal>
  )
}
