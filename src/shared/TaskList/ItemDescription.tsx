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
      paddingInlineStart=".25em"
      paddingBlockStart=".3em"
      paddingBlockEnd=".1em"
      borderRadius="0"
      textDecoration={isDone ? "line-through" : "none"}
      _focusVisible={{
        outline: "none",
      }}
    >
      {description}
    </EditableText>
  )
}
