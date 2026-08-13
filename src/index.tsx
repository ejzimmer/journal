import React from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { App } from "./App"

import { initializeApp } from "firebase/app"
import { getDatabase } from "firebase/database"
import {
  createFirebaseContext,
  FirebaseContext,
} from "./shared/FirebaseContext"
import { BrowserRouter } from "react-router-dom"
import { createMockFirebaseContext, isMockFirebaseEnabled } from "./shared/mockFirebase"
import { mockSeedData } from "./shared/mockSeedData"

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

// Mock mode never calls initializeApp/getDatabase, so it can't reach the
// real Firebase project even by accident.
const contextValue = isMockFirebaseEnabled()
  ? createMockFirebaseContext(mockSeedData)
  : createFirebaseContext(getDatabase(initializeApp(firebaseConfig)))

const container = document.getElementById("root")
const root = createRoot(container!)

root.render(
  <React.StrictMode>
    <FirebaseContext.Provider value={contextValue}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </FirebaseContext.Provider>
  </React.StrictMode>
)
