import { IconProps } from './types';
import './Clipboard.css';

type ClipboardIconProps = IconProps & { showTick?: boolean };

export function ClipboardIcon({
  colour = 'currentColor',
  showTick,
  ...props
}: ClipboardIconProps) {
  return (
    <svg
      viewBox="0 0 22.5 22"
      stroke={colour}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="100%"
      fill="none"
      className={`clipboard ${showTick ? 'show-tick' : ''}`}
      {...props}
    >
      <path
        className="board"
        d="M15.25,3 L18.5,3 Q19.5,3 19.5,4 L19.5,20 Q19.5,21 18.5,21 L4,21 Q3,21 3,20 L3,4 Q3,3 4,3 L7.25,3"
        pathLength="1"
      />
      <path
        className="clip"
        d="M8.25,1 L14.25,1 Q15.25,1 15.25,2 L15.25,4 Q15.25,5 14.25,5 L8.25,5 Q7.25,5 7.25,4 L7.25,2 Q7.25,1 8.25,1"
        pathLength="1"
      />
      <path className="tick" d="M3,12 L9,18 19.5,3" pathLength="1" />
    </svg>
  );
}
