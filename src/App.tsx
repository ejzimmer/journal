import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/tabs"
import { Track } from "./tabs/Track"
import { Todo } from "./tabs/Todo"
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
      <TabList>
        <Tab>today</Tab>
        <Tab>track</Tab>
        <Tab>todo</Tab>
        <Tab isDisabled>meetings</Tab>
        <Tab isDisabled>work hours</Tab>
        <Tab isDisabled>period</Tab>
        <Tab isDisabled>reading list</Tab>
        <Tab isDisabled>body measurements</Tab>
        <Tab isDisabled>stretching timers</Tab>
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
      </TabPanels>
    </Tabs>
  )
}
