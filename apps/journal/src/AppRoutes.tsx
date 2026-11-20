import { Routes, Route } from 'react-router-dom';
import { Today } from './tabs/Today';
import { TABS } from './tabConfig';

export function AppRoutes() {
  return (
    <Routes>
      {TABS.map(({ path, Element }) => (
        <Route key={path} path={path} element={<Element />} />
      ))}
      <Route path="/" element={<Today />} />
    </Routes>
  );
}
