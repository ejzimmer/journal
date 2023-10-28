import { Today } from "./tabs/Today"
import { Button } from "@chakra-ui/button"
import { Grid } from "@chakra-ui/layout"

import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithRedirect,
} from "firebase/auth"
import { useState } from "react"
import { Todo } from "./tabs/Todo"
import { Health } from "./tabs/Health"
import { Routes, Route, NavLink } from "react-router-dom"
import styled from "@emotion/styled"
import { Projects } from "./tabs/Projects"

const TABS = {
  today: <Today />,
  todo: <Todo />,
  health: <Health />,
  projects: <Projects />,
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
      <Grid height="100vh">
        <Button m="auto" onClick={login}>
          Log In
        </Button>
      </Grid>
    )
  }

  return (
    <>
      <Nav>
        {Object.keys(TABS).map((tab) => (
          <NavItem key={tab} to={tab}>
            {tab}
          </NavItem>
        ))}
      </Nav>

      <Routes>
        {Object.entries(TABS).map(([name, Element]) => (
          <Route key={name} path={name} element={Element} />
        ))}
        <Route path="/" element={<Today />} />
      </Routes>
    </>
  )
}

const Nav = styled.nav`
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 1rem;
  display: flex;
`

const NavItem = styled(NavLink)`
  padding: 0.5rem 1rem;
  margin-bottom: -2px;

  &.active {
    color: #2b6cb0;
    border-bottom: inherit;
    border-color: currentColor;
  }
`
