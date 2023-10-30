import { Dispatch, useState } from "react"
import { NewTaskForm } from "./NewTaskForm"
import { Button, Input, List, ListItem } from "@chakra-ui/react"
import { SubTask } from "./SubTask"
import { MouseEvent } from "react"

type Task = {
  description: string
  isDone: boolean
}

export type ProjectMetadata = {
  name: string
  tasks: Task[]
}

type Props = {
  project: ProjectMetadata
  onChange: (project: ProjectMetadata) => void
}

export function Project({ project, onChange }: Props) {
  const [showingForm, setShowingForm] = useState(false)
  const allDone = project.tasks.every((task) => task.isDone)

  const addTask = (description: string) => {
    onChange({
      ...project,
      tasks: [...project.tasks, { description, isDone: false }],
    })
    setShowingForm(false)
  }
  const updateTask = (index: number, task: Task) => {
    onChange({
      ...project,
      tasks: project.tasks.with(index, task),
    })
  }
  const removeTask = (index: number) => {
    onChange({ ...project, tasks: project.tasks.toSpliced(index, 1) })
  }

  const showForm = (event: MouseEvent) => {
    event.stopPropagation()
    setShowingForm(true)
  }
  const hideForm = () => setShowingForm(false)

  return (
    <ListItem aria-label={project.name}>
      <Input
        value={project.name}
        onChange={(event) => onChange({ ...project, name: event.target.value })}
        aria-label="Project name"
      />
      {allDone && <span>✅</span>}
      <List>
        {project.tasks.map(({ description, isDone }, index) => (
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
    </ListItem>
  )
}
