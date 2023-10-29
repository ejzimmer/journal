import { useState } from "react"
import { NewTaskForm } from "./NewTaskForm"
import { Button, Input, List } from "@chakra-ui/react"
import { SubTask } from "./SubTask"
import { MouseEvent } from "react"

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
  const [name, setName] = useState(project.name)
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

  const showForm = (event: MouseEvent) => {
    event.stopPropagation()
    setShowingForm(true)
  }
  const hideForm = () => setShowingForm(false)

  return (
    <>
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        aria-label="Project name"
      />
      {allDone && <span>✅</span>}
      <List>
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
      </List>
      {showingForm ? (
        <NewTaskForm onSubmit={addTask} onCancel={hideForm} />
      ) : (
        <Button onClick={showForm}>New task</Button>
      )}
    </>
  )
}
