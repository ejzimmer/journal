import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/tabs"
import { Track } from "./tabs/Track"
import { Todo } from "./tabs/Todo"
import { Today } from "./tabs/Today"
import { FirebaseContext } from "./shared/FirebaseContext"
import { useContext, useState } from "react"
import { Button } from "@chakra-ui/button"
import { Grid } from "@chakra-ui/layout"

export function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { login, getUser } = useContext(FirebaseContext)

  const logMeIn = async () => {
    if (!login || !getUser) return

    await login()
    setIsLoggedIn(!!getUser())
  }

  if (!isLoggedIn) {
    return (
      <Grid height="100vh">
        <Button m="auto" onClick={logMeIn}>
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
