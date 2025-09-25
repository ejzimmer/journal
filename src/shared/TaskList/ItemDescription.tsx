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
      style={{
        paddingInlineStart: ".25em",
        paddingBlockStart: ".3em",
        paddingBlockEnd: ".1em",
        border: "none",
        textDecoration: isDone ? "line-through" : "none",
      }}
    >
      {description}
    </EditableText>
  )
}
