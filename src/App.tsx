import { Today } from "./tabs/Today"

import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithRedirect,
} from "firebase/auth"
import { useState } from "react"
import { Todo } from "./tabs/Todo"
import { Routes, Route, NavLink } from "react-router-dom"
import { Work } from "./tabs/Work"

import "./App.css"

const TABS = {
  today: <Today />,
  todo: <Todo />,
  work: <Work />,
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
          <Route path="/" element={<Today />} />
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
