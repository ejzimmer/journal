import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/tabs"
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
import { Track } from "./tabs/Track"
import { Todo } from "./tabs/Todo"

// Move items between lists
// fix delete button in track

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
    <Tabs>
      <TabList position="sticky" top="0" background="white" zIndex="1">
        <Tab>today</Tab>
        <Tab>track</Tab>
        <Tab>todo</Tab>
        <Tab isDisabled>work</Tab>
        <Tab isDisabled>health</Tab>
        <Tab isDisabled>reading list</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <Today />
        </TabPanel>
        <TabPanel>
          <Track />
        </TabPanel>
        <TabPanel>
          <Todo />
        </TabPanel>
        <TabPanel>show meetings work hours work todos</TabPanel>
        <TabPanel>body measurements stretching timers period tracking</TabPanel>
      </TabPanels>
    </Tabs>
  )
}
