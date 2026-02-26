import { useContext, useState } from "react"
import { FormControl } from "../../shared/controls/FormControl"
import { categories, Category, PROJECTS_KEY, ProjectDetails } from "./types"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { TickIcon } from "../../shared/icons/Tick"

export function AddProjectForm() {
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<Category>("🧹")

  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!description || !category) {
      return
    }

    storageContext.addItem<ProjectDetails>(PROJECTS_KEY, {
      description,
      category,
    })

    setDescription("")
    setCategory("🧹")
  }

  return (
    <form
      style={{
        padding: "8px 16px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "12px",
      }}
      onSubmit={handleSubmit}
    >
      <FormControl
        label="Description"
        value={description}
        onChange={setDescription}
        hideLabel
        inputClass="subtle"
      />
      <div>
        <select
          aria-label="Category"
          value={category}
          onChange={(event) => setCategory(event.target.value as Category)}
          className="subtle"
        >
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="ghost">
        <TickIcon width="24px" colour="var(--success-colour)" />
      </button>
    </form>
  )
}
