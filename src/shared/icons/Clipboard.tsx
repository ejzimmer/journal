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
      <g className="board">
        <path
          d="M7.25,3 L4,3 Q3,3 3,4 L3,20 Q3,21 4,21 L18.5,21 Q19.5,21 19.5,20 L19.5,4 Q19.5,3 18.5,3 L15.25,3"
          pathLength="1"
        />
        <path
          d="M8.25,1 L14.25,1 Q15.25,1 15.25,2 L15.25,4 Q15.25,5 14.25,5 L8.25,5 Q7.25,5 7.25,4 L7.25,2 Q7.25,1 8.25,1"
          pathLength="1"
        />
      </g>
      <path className="tick" d="M3,12 L9,18 19.5,3" pathLength="1" />
    </svg>
  );
}
