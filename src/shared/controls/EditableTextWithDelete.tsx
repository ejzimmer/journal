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
  return (
    <>
      <EditableText
        label={label}
        onChange={(text) => {
          if (text) {
            onChange(text)
          } else {
            onDelete()
          }
        }}
        {...props}
      >
        {value}
      </EditableText>
    </>
  )
}
