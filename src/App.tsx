import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/tabs"
import { Habits } from "./Tabs/Habits"
import { Todo } from "./Tabs/Todo"

export function App() {
  return (
    <Tabs>
      <TabList>
        <Tab>habits</Tab>
        <Tab>todo</Tab>
        <Tab isDisabled>today</Tab>
        <Tab isDisabled>meetings</Tab>
        <Tab isDisabled>work hours</Tab>
        <Tab isDisabled>period</Tab>
        <Tab isDisabled>reading list</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <Habits />
        </TabPanel>
        <TabPanel>
          <Todo />
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}
