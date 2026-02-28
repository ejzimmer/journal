import { useContext, useEffect, useRef, useState } from "react"
import { PlusIcon } from "../../shared/icons/Plus"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { CategoriesContext } from "."
import { TodoCategory, TodoTask } from "../../shared/types"
import { FormControl } from "../../shared/controls/FormControl"
import { CategoryControl } from "./CategoryControl"

type AddTaskFormProps<T> = {
  listId: string
  getAdditionalFieldValues: () => T
  children: React.ReactNode
}

export function AddTaskForm<T>({
  listId,
  getAdditionalFieldValues,
  children,
}: AddTaskFormProps<T>) {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }
  const { value } =
    storageContext.useValue<Record<string, T & TodoTask>>(listId)

  const categories = useContext(CategoriesContext)
  if (!categories) {
    throw new Error("Missing categories context provider")
  }

  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<TodoCategory | undefined>(
    categories[0],
  )

  const formRef = useRef<HTMLFormElement>(null)
  const formHeightRef = useRef(0)

  const [formVisible, setFormVisible] = useState(false)

  useEffect(() => {
    if (formRef.current) {
      formHeightRef.current = formRef.current.scrollHeight
    }
  }, [])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!description || !category) {
      return
    }

    const additionalFields = getAdditionalFieldValues()
    if (!additionalFields) {
      return
    }

    storageContext.addItem<TodoTask & T>(listId, {
      description,
      category,
      position: value ? Object.keys(value).length : 0,
      ...additionalFields,
    } as TodoTask & T)

    setDescription("")
    setCategory(categories[0])
    setFormVisible(false)
  }

  return (
    <>
      <button
        className={`icon subtle ${formVisible ? "form-visible" : ""}`}
        onClick={() => setFormVisible(!formVisible)}
      >
        <PlusIcon width="16px" />
      </button>
      <form
        ref={formRef}
        className={formVisible ? "visible" : ""}
        style={{ height: formVisible ? formHeightRef.current : 0 }}
        onSubmit={handleSubmit}
      >
        <FormControl
          label="Description"
          value={description}
          onChange={setDescription}
        />
        <div>
          <div className="label">Category</div>
          <CategoryControl onChange={setCategory} value={category} />
        </div>

        {children}
        <div className="buttons">
          <button type="submit" className="primary">
            Create
          </button>
          <button
            type="reset"
            className="white outline"
            onClick={() => setFormVisible(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  )
}
