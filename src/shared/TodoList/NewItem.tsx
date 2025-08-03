import { ChangeEvent, FormEvent, useContext, useState } from "react"
import { FirebaseContext } from "../FirebaseContext"
import { Category, COLOURS } from "./types"

interface Props {
  list: string
  showFrequency?: boolean
}

export function NewItem({ list, showFrequency }: Props) {
  const firebaseContext = useContext(FirebaseContext)
  if (!firebaseContext) {
    throw new Error("no firebase context found in NewItem")
  }
  const { addItem: addItemToList } = firebaseContext
  const [description, setDescription] = useState("")
  const [type, setType] = useState<Category>("🧹")
  const [frequency, setFrequency] = useState("一回")

  const updateDescription = (event: ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value)
  }
  const updateType = (event: ChangeEvent<HTMLSelectElement>) => {
    setType(event.target.value as Category)
  }
  const updateFrequency = (event: ChangeEvent<HTMLSelectElement>) => {
    setFrequency(event.target.value)
  }

  const submitForm = (event: FormEvent) => {
    event.preventDefault()
    addItemToList(list, { description, type, frequency })
    setDescription("")
  }

  return (
    <form action="#" onSubmit={submitForm}>
      <div style={{ display: "flex", gap: "4", maxWidth: "600px" }}>
        <select
          style={{ width: "120px" }}
          onChange={updateType}
          aria-label="task type"
        >
          {Object.keys(COLOURS).map((category) => (
            <option
              value={category}
              key={category}
              selected={category === type}
            />
          ))}
        </select>
        <input onChange={updateDescription} value={description} />
        {showFrequency && (
          <select style={{ width: "140px" }} onChange={updateFrequency}>
            {["一回", "毎日", "平日"].map((f) => (
              <option key={f} value={f} selected={frequency === f}>
                {f}
              </option>
            ))}
          </select>
        )}
      </div>
    </form>
  )
}
