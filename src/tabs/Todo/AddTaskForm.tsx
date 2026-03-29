import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { PlusIcon } from "../../shared/icons/Plus"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { CategoriesContext } from "."
import { TodoTask } from "../../shared/types"
import { FormControl } from "../../shared/controls/FormControl"
import { Combobox } from "../../shared/controls/combobox/Combobox"
import { OptionType } from "../../shared/controls/combobox/types"

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
  const categoryOptions = useMemo(
    () => categories.map((category) => ({ id: category, label: category })),
    [categories],
  )

  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<OptionType>(categoryOptions[0])

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
      category: category.label,
      position: value ? Object.keys(value).length : 0,
      ...additionalFields,
    } as TodoTask & T)

    setDescription("")
    setCategory(categoryOptions[0])
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
        className={formVisible ? "today-form visible" : "today-form"}
        style={{ height: formVisible ? formHeightRef.current : 0 }}
        onSubmit={handleSubmit}
      >
        <div className="description">
          <FormControl
            label="Description"
            value={description}
            onChange={setDescription}
          />
        </div>
        <div>
          <Combobox
            label="Category"
            value={category}
            options={categoryOptions}
            createOption={(value) => ({ id: value, label: value })}
            onChange={(value) => setCategory(value)}
            inputSize={2}
          />
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
