import {
  CSSProperties,
  ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import './StampMenu.css';

// Starting tilt for each item (by position), so they don't all fly out
// from the same angle when the menu opens.
const JITTER_DEGREES = [-6, 4, -3, 8, -5];

// Below this much space to the left, the full circle would spill off the
// page, so the menu switches to a half-circle on the right instead.
const LEFT_EDGE_THRESHOLD_PX = 90;

export type StampMenuOption = {
  key: string;
  label: string;
  content: ReactNode;
  className?: string;
  onSelect: () => void;
};

type StampMenuProps = {
  trigger: (props: { popoverTarget: string; className: string }) => ReactNode;
  options: StampMenuOption[];
};

export function StampMenu({ trigger: Trigger, options }: StampMenuProps) {
  const id = useId();
  const anchorRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<'full' | 'half'>('full');

  const close = () => popoverRef.current?.hidePopover();
  const angleStep =
    layout === 'full' ? 360 / options.length : 180 / (options.length - 1);

  useEffect(() => {
    const popover = popoverRef.current;
    const anchor = anchorRef.current;
    if (!popover || !anchor) return;

    const onBeforeToggle = (event: Event) => {
      if ((event as ToggleEvent).newState !== 'open') return;
      const { left, top, width, height } = anchor.getBoundingClientRect();
      setLayout(left < LEFT_EDGE_THRESHOLD_PX ? 'half' : 'full');
      popover.style.top = `${top + height / 2 + window.scrollY}px`;
      popover.style.left = `${left + width / 2 + window.scrollX}px`;
    };

    popover.addEventListener('beforetoggle', onBeforeToggle);
    return () => popover.removeEventListener('beforetoggle', onBeforeToggle);
  }, []);

  return (
    <span className="stamp-menu-anchor" ref={anchorRef}>
      <Trigger popoverTarget={id} className="stamp-trigger" />
      <div
        id={id}
        ref={popoverRef}
        className="stamp-menu"
        style={{ '--angle-step': `${angleStep}deg` } as CSSProperties}
        popover="auto"
      >
        {options.map(({ key, label, content, className, onSelect }, index) => (
          <button
            key={key}
            aria-label={label}
            className={`stamp-menu-item ${className ?? ''}`}
            style={
              {
                '--index': index,
                '--jitter': `${JITTER_DEGREES[index]}deg`,
              } as CSSProperties
            }
            onClick={() => {
              onSelect();
              close();
            }}
          >
            {content}
          </button>
        ))}
      </div>
    </span>
  );
}
