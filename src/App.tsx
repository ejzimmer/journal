import { Today } from "./tabs/Today"
import { Button } from "@chakra-ui/react"
import { Box, Grid } from "@chakra-ui/react"

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
      <Grid height="100vh">
        <Button m="auto" onClick={login}>
          Log In
        </Button>
      </Grid>
    )
  }

  return (
    <>
      <Box
        as="nav"
        position="sticky"
        top={0}
        background="white"
        zIndex={1}
        borderBottom="2px solid #e2e8f0"
        marginBottom="1rem"
        display="flex"
      >
        {Object.keys(TABS).map((tab) => (
          <NavItem key={tab} to={tab}>
            {tab}
          </NavItem>
        ))}
      </Box>

      <Box paddingInline="30px" paddingBlock="20px">
        <Routes>
          {Object.entries(TABS).map(([name, Element]) => (
            <Route key={name} path={name} element={Element} />
          ))}
          <Route path="/" element={<Today />} />
        </Routes>
      </Box>
    </>
  )
}

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Box
      padding=".5rem 1rem"
      marginBottom="-2px"
      css={{
        "& .active": {
          color: "#2b6cb0",
          borderBottom: "inherit",
          borderColor: "currentColor",
        },
      }}
    >
      <NavLink to={to}>{children}</NavLink>
    </Box>
  )
}
