import { useRef, FormEvent, useEffect, useId, useState } from "react"
import { parse } from "date-fns"
import { Item, Label } from "./types"
import { Tag, TAG_COLOURS } from "../../tabs/Work/Tag"
import { Combobox } from "../controls/Combobox"
import "./AddTaskForm.css"

export function AddTaskForm({
  onSubmit,
  onCancel,
  labelOptions,
}: {
  onSubmit: (
    task: Omit<Partial<Item>, "labels"> & {
      labels?: Label[]
    }
  ) => void
  onCancel: (event?: React.MouseEvent) => void
  labelOptions: Label[]
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const descriptionId = useId()
  const dueDateId = useId()
  const [labels, setLabels] = useState<Label[]>([])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    const controls = formRef.current?.elements
    if (!controls) return

    // @ts-ignore
    const description = controls[descriptionId].value
    if (!description) return

    // @ts-ignore
    const dueDate = controls[dueDateId].value

    onSubmit({
      description,
      dueDate: dueDate
        ? parse(dueDate, "yyyy-MM-dd", new Date()).getTime()
        : undefined,
      labels,
    })

    formRef.current?.reset()
    setLabels([])
  }

  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!formRef.current) return

      if (
        event.target &&
        !formRef.current.contains(event.target as HTMLElement)
      ) {
        onCancel()
      }
    }

    window.addEventListener("click", listener)

    return () => window.removeEventListener("click", listener)
  }, [onCancel])

  return (
    <form
      ref={formRef}
      style={{
        outline: "2px dashed",
        paddingBlock: "4px",
        paddingInline: "8px",
        marginBlockStart: "40px",
      }}
      onSubmit={handleSubmit}
    >
      <textarea
        className="description"
        aria-label="Task description"
        id={descriptionId}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            handleSubmit(event)
          }
        }}
      />
      <div className="form-item">
        <label htmlFor={dueDateId}>Due date:</label>
        <input id={dueDateId} type="date" className="due-date" />
      </div>
      <div style={{ alignItems: "center" }}>
        <div className="form-item" style={{ marginBlock: "0" }}>
          <label>Labels</label>
          <Combobox<Label & { id: string; label: string }>
            value={labels.map((l) => ({
              id: l.text + l.colour,
              label: l.text,
              ...l,
            }))}
            onChange={(opts) => setLabels(opts)}
            options={labelOptions.map((l) => ({
              id: l.text + l.colour,
              label: l.text,
              ...l,
            }))}
            renderButton={Tag}
            createOption={(text) => {
              const colour = TAG_COLOURS[2]
              return {
                id: `${text}${colour}`,
                label: text,
                text,
                colour,
              }
            }}
            onAddOption={() => console.log("add option")}
          />
        </div>
        <button
          style={{
            fontSize: "1em",
            padding: "2px",
          }}
          type="reset"
          onClick={onCancel}
        >
          ❌
        </button>
        <button style={{ padding: "2px", fontSize: "1em" }} type="submit">
          ✅
        </button>
      </div>
    </form>
  )
}
