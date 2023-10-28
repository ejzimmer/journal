import { useState } from "react"
import { EditableText } from "./EditableText"
import { NewTaskForm } from "./NewTaskForm"
import { Button } from "@chakra-ui/react"
import { SubTask } from "./SubTask"

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
  const [tasks, setTasks] = useState(project.tasks)
  const [showingForm, setShowingForm] = useState(false)
  const allDone = tasks.every((task) => task.isDone)

  const addTask = (description: string) => {
    setTasks((tasks) => [...tasks, { description, isDone: false }])
    setShowingForm(false)
  }
  const updateTask = (index: number, task: Task) => {
    setTasks((tasks) => tasks.with(index, task))
  }
  const removeTask = (index: number) => {
    setTasks((tasks) => tasks.toSpliced(index, 1))
  }

  const showForm = () => setShowingForm(true)
  const hideForm = () => setShowingForm(false)

  return (
    <>
      <EditableText value={project.name} onChange={() => undefined} />
      {allDone && <span>✅</span>}
      <ul>
        {tasks.map(({ description, isDone }, index) => (
          <SubTask
            key={description}
            title={description}
            isDone={isDone}
            onDoneChange={(isDone) =>
              updateTask(index, { description, isDone })
            }
            onTitleChange={(description) =>
              updateTask(index, { description, isDone })
            }
            onDelete={() => removeTask(index)}
          />
        ))}
      </ul>
      {showingForm ? (
        <NewTaskForm onSubmit={addTask} onCancel={hideForm} />
      ) : (
        <Button onClick={showForm}>New task</Button>
      )}
    </>
  )
}
