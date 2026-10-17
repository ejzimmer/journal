import { KeyboardEvent } from 'react';

type UpdateStretchButtonProps = {
  label: string;
  path: string;
  onClick: () => void;
  onHighlight?: (isHighlighted: boolean) => void;
};

export function UpdateStretchButton({
  label,
  path,
  onClick,
  onHighlight,
}: UpdateStretchButtonProps) {
  const clickOnEnterOrSpace = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <path
      className="update-stretch"
      role="button"
      tabIndex={0}
      aria-label={label}
      d={path}
      onClick={onClick}
      onKeyDown={clickOnEnterOrSpace}
      onPointerEnter={() => onHighlight?.(true)}
      onPointerLeave={() => onHighlight?.(false)}
      onFocus={() => onHighlight?.(true)}
      onBlur={() => onHighlight?.(false)}
    />
  );
}
