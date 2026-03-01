import { useState } from "react"
import { ConfirmationModalDialog } from "./ConfirmationModal"
import { EditableText, EditableTextProps } from "./EditableText"

type EditableTextWithDeleteProps = Omit<EditableTextProps, "children"> & {
  value: string
  onDelete: () => void
}

export function EditableTextWithDelete({
  label,
  value,
  onChange,
  onDelete,
  ...props
}: EditableTextWithDeleteProps) {
  const [confirmDeleteModalVisible, setConfirmDeleteModalVisible] =
    useState(false)

  return (
    <>
      <EditableText
        label={label}
        onChange={(text) => {
          if (text) {
            onChange(text)
          } else {
            setConfirmDeleteModalVisible(true)
          }
        }}
        {...props}
      >
        {value}
      </EditableText>
      {confirmDeleteModalVisible && (
        <ConfirmationModalDialog
          message={`Are you sure you want to delete ${value}`}
          onConfirm={onDelete}
          isOpen={confirmDeleteModalVisible}
          onCancel={() => setConfirmDeleteModalVisible(false)}
        />
      )}
    </>
  )
}
