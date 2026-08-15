import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
} from "firebase/auth"
import { useState } from "react"

import "./App.css"
import { Loading } from "./shared/loading"
import { TopNav } from "./TopNav"
import { AppRoutes } from "./AppRoutes"

export function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setLoggedIn] = useState(false)
  const auth = getAuth()

  onAuthStateChanged(auth, () => {
    setIsLoading(false)
    setLoggedIn(!!auth.currentUser)
  })

  const login = () => {
    const provider = new GoogleAuthProvider()
    signInWithPopup(auth, provider)
    // signInWithRedirect(auth, provider)
  }

  if (isLoading) {
    return (
      <div
        style={{
          width: "fit-content",
          height: "100vh",
          alignContent: "center",
          margin: "auto",
        }}
      >
        <Loading />
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="not-logged-in">
        <button onClick={login}>Log In</button>
      </div>
    )
  }

  return (
    <div className="main-content">
      <TopNav />
      <AppRoutes />
    </div>
  )
}
