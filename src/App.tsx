import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/tabs"
import React from "react"

export function App() {
  return (
    <Tabs>
      <TabList>
        <Tab>Habits</Tab>
        <Tab isDisabled>Todo Today</Tab>
        <Tab isDisabled>Todo</Tab>
        <Tab isDisabled>Meetings</Tab>
        <Tab isDisabled>Work hours</Tab>
        <Tab isDisabled>Period</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <p>one!</p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}
