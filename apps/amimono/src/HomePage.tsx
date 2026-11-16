import { useState } from 'react';
import { AppUpdateButton } from 'shared/AppUpdateButton';
import { Tab, Tabs } from 'shared/controls/Tabs';

import './HomePage.css';
import { ProjectsTab } from './ProjectsTab';
import { SockPlanner } from './sockPlanner/SockPlanner';
import { YARN_COLOUR_PROPERTIES } from './yarnBowl/utils';

type TabId = 'projects' | 'socks';

const TABS: Tab<TabId>[] = [
  { id: 'projects', label: 'Projects' },
  { id: 'socks', label: 'Socks' },
];

export function HomePage() {
  const [selectedTab, setSelectedTab] = useState<TabId>('projects');

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
        {selectedTab === 'projects' ? <ProjectsTab /> : <SockPlanner />}
      </Tabs>
    </main>
  );
}
