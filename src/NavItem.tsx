import { NavLink } from 'react-router-dom';

type NavItemProps = {
  to: string;
  isHidden: boolean;
  onFocus: React.FocusEventHandler<HTMLAnchorElement> | undefined;
  children: React.ReactNode;
};

export function NavItem({ to, isHidden, onFocus, children }: NavItemProps) {
  return (
    <li hidden={isHidden}>
      <NavLink to={to} onFocus={onFocus}>
        {children}
      </NavLink>
    </li>
  );
}
