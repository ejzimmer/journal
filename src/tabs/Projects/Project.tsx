import { useContext } from "react"
import { EditableText } from "../../shared/controls/EditableText"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { TickIcon } from "../../shared/icons/Tick"
import { XIcon } from "../../shared/icons/X"
import { COLOURS, KEY, ProjectDetails } from "./type"

import "./Project.css"
import { EmojiCheckbox } from "../../shared/controls/EmojiCheckbox"

type ProjectProps = {
  project: ProjectDetails
}

export function Project({ project }: ProjectProps) {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  return (
    <li
      className={`project ${project.status}`}
      style={{
        background:
          project.type in COLOURS
            ? COLOURS[project.type as keyof typeof COLOURS]
            : "white",
      }}
    >
      <EmojiCheckbox
        emoji={project.type}
        isChecked={project.status === "in_progress"}
        onChange={() =>
          storageContext.updateItem(KEY, {
            ...project,
            status: project.status === "in_progress" ? "ready" : "in_progress",
          })
        }
        label={""}
      />
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
  )
}
