import { createContext } from "react"
import { Label } from "../../shared/TaskList/types"

export const LabelsContext = createContext<Label[] | undefined>(undefined)
