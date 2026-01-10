import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
} from "firebase/auth"
import { useState } from "react"
import { Todo } from "./tabs/Todo"
import { Projects } from "./tabs/Projects"
import { Routes, Route, NavLink } from "react-router-dom"
import { Work } from "./tabs/Work"

import "./App.css"
import { Media } from "./tabs/Media"
import { ThisYear } from "./tabs/ThisYear"

const TABS = [
  { path: "todo", Element: Todo },
  { path: "2026", Element: ThisYear },
  { path: "projects", Element: Projects },
  { path: "media", Element: Media },
  { path: "work", Element: Work },
]

export function App() {
  const [isLoggedIn, setLoggedIn] = useState(false)
  const auth = getAuth()

  onAuthStateChanged(auth, () => {
    setLoggedIn(!!auth.currentUser)
  })

  const login = () => {
    const provider = new GoogleAuthProvider()
    signInWithPopup(auth, provider)
    // signInWithRedirect(auth, provider)
  }

  if (!isLoggedIn) {
    return (
      <div className="not-logged-in">
        <button onClick={login}>Log In</button>
      </div>
    )
  }

  return (
    <>
      <nav>
        <ul>
          {TABS.map(({ path }) => (
            <NavItem key={path} to={path}>
              {path}
            </NavItem>
          ))}
        </ul>
      </nav>

      <div className="main-content">
        <Routes>
          {TABS.map(({ path, Element }) => (
            <Route key={path} path={path} element={<Element />} />
          ))}
          <Route path="/" element={<Todo />} />
        </Routes>
      </div>
    </>
  )
}

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <NavLink to={to}>{children}</NavLink>
    </li>
  )
}
