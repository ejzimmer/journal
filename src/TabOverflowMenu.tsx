import { NavLink, useLocation } from 'react-router-dom';
import { Menu } from './shared/controls/Menu';
import { EllipsisIcon } from './shared/icons/Ellipsis';

type TabOverflowMenuProps = {
  paths: string[];
};

export function TabOverflowMenu({ paths }: TabOverflowMenuProps) {
  const { pathname } = useLocation();
  const currentPath = pathname.split('/')[1];
  const isUnused = paths.length === 0;
  const holdsActiveTab = paths.includes(currentPath);

  return (
    <li className={`tab-overflow${isUnused ? ' unused' : ''}`}>
      <Menu
        trigger={(props) => (
          <button
            {...props}
            className={holdsActiveTab ? 'active' : undefined}
            aria-label="More tabs"
          >
            <EllipsisIcon width="20px" />
          </button>
        )}
      >
        {({ onClose }) =>
          paths.map((path) => (
            <NavLink key={path} to={path} role="menuitem" onClick={onClose}>
              {path}
            </NavLink>
          ))
        }
      </Menu>
    </li>
  );
}
