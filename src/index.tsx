import React from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import "./index.css"
import { App } from "./App"
import { AppUpdateBanner } from "./shared/AppUpdateBanner"
import { setWaitingRegistration } from "./shared/appUpdateStore"
import * as serviceWorkerRegistration from "./serviceWorkerRegistration"

import { initializeApp } from "firebase/app"
import { getDatabase } from "firebase/database"
import { FirebaseContext } from "./shared/FirebaseContext"
import { createLocalFirstContext } from "./shared/localFirst/createLocalFirstContext"

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

const { context: contextValue, hydrate } = createLocalFirstContext(
  getDatabase(initializeApp(firebaseConfig)),
)

// Registered synchronously (not after hydrate resolves): the registration
// helper waits on the window "load" event, which can fire before an async
// IndexedDB read finishes, so it must not be delayed behind one.
serviceWorkerRegistration.register({ onUpdate: setWaitingRegistration })

hydrate().then(() => {
  const container = document.getElementById("root")
  const root = createRoot(container!)

  root.render(
    <React.StrictMode>
      <FirebaseContext.Provider value={contextValue}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </FirebaseContext.Provider>
      <AppUpdateBanner />
    </React.StrictMode>,
  )
})
