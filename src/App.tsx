import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/tabs"
import { Track } from "./tabs/Track"
import { Todo } from "./tabs/Todo"
import { Today } from "./tabs/Today"

export function App() {
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
