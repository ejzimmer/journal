import React from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "./components/ui/provider"

import "./index.css"
import { App } from "./App"

import { initializeApp } from "firebase/app"
import { getDatabase } from "firebase/database"
import {
  createFirebaseContext,
  FirebaseContext,
} from "./shared/FirebaseContext"
import { BrowserRouter } from "react-router-dom"

import { Theme } from "@chakra-ui/react"

const firebaseConfig = {
  apiKey: "AIzaSyAlKw5_aMOUlR3SdkbU6vHADLTUvXZHNJg",
  authDomain: "journal-50dcf.firebaseapp.com",
  projectId: "journal-50dcf",
  storageBucket: "journal-50dcf.appspot.com",
  messagingSenderId: "212303689127",
  appId: "1:212303689127:web:4cb9352399529de15ff282",
  databaseURL:
    "https://journal-50dcf-default-rtdb.asia-southeast1.firebasedatabase.app",
}

const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

const contextValue = createFirebaseContext(database)

const container = document.getElementById("root")
const root = createRoot(container!)

root.render(
  <React.StrictMode>
    <Provider>
      <Theme appearance="light">
        <FirebaseContext.Provider value={contextValue}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </FirebaseContext.Provider>
      </Theme>
    </Provider>
  </React.StrictMode>
)
