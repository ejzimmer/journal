import React from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import "../index.css"
import { FirebaseContext } from "../shared/FirebaseContext"
import { createMockFirebaseContext } from "../shared/mockFirebase"
import { seedData } from "./seedData"
import { App } from "./App"

const contextValue = createMockFirebaseContext(seedData)

const container = document.getElementById("root")
const root = createRoot(container!)

root.render(
  <React.StrictMode>
    <FirebaseContext.Provider value={contextValue}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </FirebaseContext.Provider>
  </React.StrictMode>,
)
