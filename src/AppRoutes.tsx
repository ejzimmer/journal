import { Routes, Route } from 'react-router-dom';
import { Todo } from './tabs/Todo';
import { TABS } from './tabConfig';
import { DataVersions } from './DataVersions';

export function AppRoutes() {
  return (
    <Routes>
      {TABS.map(({ path, Element }) => (
        <Route key={path} path={path} element={<Element />} />
      ))}
      <Route path="/" element={<Todo />} />
      <Route path="data" element={<DataVersions />} />
    </Routes>
  );
}
