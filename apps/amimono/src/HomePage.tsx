import { useState } from 'react';
import { AppUpdateButton } from 'shared/AppUpdateButton';
import { Tab, Tabs } from 'shared/controls/Tabs';

import './HomePage.css';
import { JumpersTab } from './jumpers/JumpersTab';
import { ProjectsTab } from './ProjectsTab';
import { SockPlanner } from './sockPlanner/SockPlanner';
import { YARN_COLOUR_PROPERTIES } from './yarnBowl/utils';

type TabId = 'projects' | 'socks' | 'jumpers';

const TAB_CONTENTS: Record<TabId, () => React.ReactElement> = {
  projects: ProjectsTab,
  socks: SockPlanner,
  jumpers: JumpersTab,
};

const TABS: Tab<TabId>[] = [
  { id: 'projects', label: 'Projects' },
  { id: 'socks', label: 'Socks' },
  { id: 'jumpers', label: 'Jumpers' },
];

export function HomePage() {
  const [selectedTab, setSelectedTab] = useState<TabId>('projects');
  const SelectedTab = TAB_CONTENTS[selectedTab];

  return (
    <main className="home-page" style={YARN_COLOUR_PROPERTIES}>
      <h1 className="visually-hidden">Amimono</h1>
      <AppUpdateButton />
      <Tabs
        tabs={TABS}
        selectedTab={selectedTab}
        onSelectTab={setSelectedTab}
        label="Amimono"
      >
        <SelectedTab />
      </Tabs>
    </main>
  );
}
