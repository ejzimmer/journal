import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/tabs"
import React from "react"
import { Habits } from "./Tabs/Habits"

export function App() {
  return (
    <Tabs>
      <TabList>
        <Tab>habits</Tab>
        <Tab isDisabled>today</Tab>
        <Tab isDisabled>todo</Tab>
        <Tab isDisabled>meetings</Tab>
        <Tab isDisabled>work hours</Tab>
        <Tab isDisabled>period</Tab>
        <Tab isDisabled>reading list</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <Habits />
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}
