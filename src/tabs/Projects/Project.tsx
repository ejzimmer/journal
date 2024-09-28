import { Button, Select } from "@chakra-ui/react"
import { EditableText } from "../../shared/controls/EditableText"
import { TaskList } from "../../shared/TaskList"
import { COLOURS } from "../../shared/TodoList/types"
import { AddTaskForm } from "../../shared/TaskList/AddTaskForm"
import { UpdateItem } from "../../shared/storage/Context"
import { useContext, useState } from "react"

type ProjectDetails = {
  name: string
  category: string
  status: string
  tasks: string[]
}

type ProjectProps = {
  project: ProjectDetails
  onChange: (project: ProjectDetails) => void
}

const STATUSES = ["not started", "in progress", "requires materials", "done"]

export function Project({ project, onChange }: ProjectProps) {
  const [showAddTaskForm, setShowAddTaskForm] = useState(
    project.tasks.length === 0
  )

  const { onAddTask } = useContext(UpdateItem)

  const addTask = (description: string) => {
    onAddTask(description)
    // get task id and add task to task list
  }

  const handleChange = (updates: Partial<ProjectDetails>) =>
    onChange({ ...project, ...updates })

  return (
    <>
      <h2>
        <EditableText
          label="Project name"
          onChange={(name) => handleChange({ name })}
        >
          {project.name}
        </EditableText>
      </h2>
      <Select
        aria-label="Category"
        value={project.category}
        onChange={(event) => handleChange({ category: event.target.value })}
      >
        {Object.keys(COLOURS).map((category) => (
          <option key={category}>{category}</option>
        ))}
      </Select>
      <Select
        aria-label="Status"
        value={project.status}
        onChange={(event) => handleChange({ status: event.target.value })}
      >
        {STATUSES.map((status) => (
          <option key={status}>{status}</option>
        ))}
      </Select>
      <TaskList tasks={project.tasks} />
      {showAddTaskForm ? (
        <AddTaskForm
          onSubmit={addTask}
          onCancel={() => setShowAddTaskForm(false)}
        />
      ) : (
        <Button onClick={() => setShowAddTaskForm(true)}>Add task</Button>
      )}
    </>
  )
}
