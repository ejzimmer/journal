import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithRedirect,
} from "firebase/auth"
import { useState } from "react"
import { Todo } from "./tabs/Todo"
import { Projects } from "./tabs/Projects"
import { Routes, Route, NavLink } from "react-router-dom"
import { Work } from "./tabs/Work"

import "./App.css"
import { Media } from "./tabs/Media"
import { ThisYear } from "./tabs/ThisYear"

const TABS = {
  todo: <Todo />,
  projects: <Projects />,
  media: <Media />,
  work: <Work />,
  "2025": <ThisYear />,
}

export function App() {
  const [isLoggedIn, setLoggedIn] = useState(false)
  const auth = getAuth()

  onAuthStateChanged(auth, () => {
    setLoggedIn(!!auth.currentUser)
  })

  const login = () => {
    const provider = new GoogleAuthProvider()
    signInWithRedirect(auth, provider)
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
          {Object.keys(TABS).map((tab) => (
            <NavItem key={tab} to={tab}>
              {tab}
            </NavItem>
          ))}
        </ul>
      </nav>

      <div className="main-content">
        <Routes>
          {Object.entries(TABS).map(([name, Element]) => (
            <Route key={name} path={name} element={Element} />
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
