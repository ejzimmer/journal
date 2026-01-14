import { createContext } from "react"
import { Label } from "./types"

export const LabelsContext = createContext<Label[] | undefined>(undefined)
