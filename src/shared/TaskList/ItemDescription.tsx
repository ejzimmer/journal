import { EditableText } from "../controls/EditableText"

type ItemDescriptionProps = {
  onChange: (description: string) => void
  description: string
  isDone: boolean
}
export function ItemDescription({
  description,
  isDone,
  onChange,
}: ItemDescriptionProps) {
  return (
    <EditableText
      onChange={onChange}
      label={`Edit description ${description}`}
      className="inline"
      style={{
        textDecoration: isDone ? "line-through" : "none",
      }}
    >
      {description}
    </EditableText>
  )
}
