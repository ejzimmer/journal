import React from "react"
import { AddTaskForm } from "./AddTaskForm"

export function Today() {
  return <AddTaskForm onSubmit={console.log} categories={[["Chore", "🧹"]]} />
}
