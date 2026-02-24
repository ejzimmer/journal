import { TodoTask } from "../../shared/types"

export function DragPreview({ task }: { task: TodoTask }) {
  return (
    <div
      style={{
        border: "1px solid",
        paddingInline: "20px",
        paddingBlockEnd: "10px",
        paddingBlockStart: "5px",
      }}
    >
      <div>{task.description}</div>
    </div>
  )
}
