import { useContext } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"

import "./index.css"
import { XIcon } from "../../shared/icons/X"
import { EditableText } from "../../shared/controls/EditableText"
import { PlayButtonIcon } from "../../shared/icons/PlayButton"
import { TickIcon } from "../../shared/icons/Tick"
import { PauseButtonIcon } from "../../shared/icons/PauseButton"

const KEY = "projects"

type ProjectDetails = {
  id: string
  description: string
  type: string
  position: number
  lastUpdated: number
  status?: "ready" | "in_progress" | "done"
}

const COLOURS = {
  "🛒": "hsla(197 36% 70% /.3)",
  "📓": "hsl(0  0% 49% / .3)",
  "🖊️": "hsl(209 79% 48% /.3)",
  "👩‍💻": "hsl(93 90% 45% / .3)",
  "🧹": "hsl(45 100% 76% / .3)",
  "🪡": "hsl(203 85% 77% / .3)",
  "🧶": "hsl(339 78% 67% / .3)",
  "🚚": "hsla(352 90% 45% / .3)",
}

export function Projects() {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const { value } = storageContext.useValue<ProjectDetails>(KEY)
  const projects = value ? Object.values(value) : undefined

  return (
    <ul className="projects">
      {projects?.map((project) => (
        <li
          className={project.status}
          style={{
            background:
              project.type in COLOURS
                ? COLOURS[project.type as keyof typeof COLOURS]
                : "white",
          }}
        >
          {project.type}
          <EditableText
            label="project"
            onChange={(description) =>
              storageContext.updateItem<ProjectDetails>(KEY, {
                ...project,
                description,
              })
            }
          >
            {project.description}
          </EditableText>
          <div className="actions">
            <button
              className="ghost"
              onClick={() =>
                storageContext.updateItem<ProjectDetails>(KEY, {
                  ...project,
                  status: project.status === "done" ? "ready" : "done",
                })
              }
            >
              <TickIcon width="20px" colour="var(--success-colour)" />
            </button>
            <button
              className="ghost"
              onClick={() => storageContext.deleteItem(KEY, project)}
            >
              <XIcon width="20px" colour="var(--body-colour-light)" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
