import React from "react"
import ReactDOM from "react-dom"
import { ChakraProvider } from "@chakra-ui/react"

import "./index.css"
import { App } from "./App"

import { initializeApp } from "firebase/app"
import { getDatabase } from "firebase/database"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import {
  createFirebaseContext,
  FirebaseContext,
} from "./shared/FirebaseContext"

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
const auth = getAuth(app)

const contextValue = createFirebaseContext(database, auth)

ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider>
      <FirebaseContext.Provider value={contextValue}>
        <App />
      </FirebaseContext.Provider>
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById("root")
)
