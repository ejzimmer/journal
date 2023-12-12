import { useState } from "react"
import { NewTaskForm } from "./NewTaskForm"
import { List, ListItem } from "@chakra-ui/react"
import { SubTask } from "./SubTask"
import { MouseEvent } from "react"
import { ColouredButton, EditableLabel } from "./style"
import { COLOURS, Category } from "../../shared/TodoList/types"

type Task = {
  description: string
  isDone: boolean
}

export type ProjectMetadata = {
  name: string
  category: Category
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

  const colour = COLOURS[project.category]
  const borderColour = `color-mix(
    in hsl shorter hue,
    ${colour},
    hsl(300 0% 25%)
  )`
  const midColour = `color-mix(in hsl shorter hue, ${colour}, hsl(300 0% 50%))`

  return (
    <ListItem
      aria-label={project.name}
      border="2px solid"
      borderColor={borderColour}
      borderRadius="12px"
      overflow="hidden"
      background={colour}
      sx={{ "--colour": colour }}
    >
      <EditableLabel
        value={project.name}
        onChange={(event) => onChange({ ...project, name: event.target.value })}
        aria-label="Project name"
        fontSize="1.2em"
        marginBlockEnd="0.5em"
        borderBottomRadius="0"
        backgroundColor={midColour}
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
      <NewTaskForm onSubmit={addTask} colour={colour} />
    </ListItem>
  )
}
