import { useState } from "react"
import { EditableText } from "./EditableText"
import { NewTaskForm } from "./NewTaskForm"
import { Button } from "@chakra-ui/react"

type Task = {
  description: string
  isDone: boolean
}

type Props = {
  project: {
    name: string
    tasks: Task[]
  }
}

export function Project({ project }: Props) {
  const [showingForm, setShowingForm] = useState(false)

  const addTask = (description: string) => {
    project.tasks = [...project.tasks, { description, isDone: false }]
  }
  const showForm = () => setShowingForm(true)
  const hideForm = () => setShowingForm(false)

  return (
    <>
      <EditableText value={project.name} onChange={() => undefined} />
      {showingForm ? (
        <NewTaskForm onSubmit={addTask} onCancel={hideForm} />
      ) : (
        <Button onClick={showForm}>New task</Button>
      )}
    </>
  )
}

// add task
// display tasks
// update project status manually
// update project status automatically
