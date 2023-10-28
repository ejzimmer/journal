import { Project } from "./Project"

const project = {
  name: "Sew shirt",
  tasks: [
    {
      description: "Trace pattern",
      isDone: false,
    },
    {
      description: "Cut fabric",
      isDone: false,
    },
    {
      description: "Adjust fit",
      isDone: false,
    },
    {
      description: "Sew everything together",
      isDone: false,
    },
  ],
}

export function Projects() {
  return <Project project={project} />
}
