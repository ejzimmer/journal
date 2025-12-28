import { createContext } from "react"
import { Label } from "../../shared/types"

export const LabelsContext = createContext<Label[] | undefined>(undefined)
