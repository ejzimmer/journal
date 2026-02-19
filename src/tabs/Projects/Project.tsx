import { useContext } from "react"
import { EditableText } from "../../shared/controls/EditableText"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { TickIcon } from "../../shared/icons/Tick"
import { XIcon } from "../../shared/icons/X"
import { COLOURS, KEY, ProjectDetails } from "./type"

import "./Project.css"
import { EmojiCheckbox } from "../../shared/controls/EmojiCheckbox"
import { ConfirmationModal } from "../../shared/controls/ConfirmationModal"

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
          project.category in COLOURS ? COLOURS[project.category] : "white",
      }}
    >
      <EmojiCheckbox
        emoji={project.category}
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
        <ConfirmationModal
          message={`Are you sure you want to delete ${project.description}`}
          onConfirm={() => storageContext.deleteItem(KEY, project)}
          trigger={(triggerProps) => (
            <button {...triggerProps} className="ghost">
              <XIcon width="20px" colour="var(--body-colour-light)" />
            </button>
          )}
        />
      </div>
    </li>
  )
}
