import { useId } from 'react';
import { ModalTriggerProps } from '../../../shared/controls/Modal';

export function PushpinButton(props: ModalTriggerProps) {
  const gradientId = useId();
  const blurId = useId();

  return (
    <button
      {...props}
      type="button"
      className="pushpin-button"
      aria-label="Add an adventure"
    >
      <svg viewBox="8 8 28 28" aria-hidden="true">
        <defs>
          <radialGradient id={gradientId} cx="38%" cy="32%" r="70%">
            <stop offset="0" stopColor="#7fd494" />
            <stop offset=".55" stopColor="#2a9940" />
            <stop offset="1" stopColor="#16602a" />
          </radialGradient>
          <filter id={blurId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>
        <ellipse
          className="pushpin-shadow"
          cx="29"
          cy="29"
          rx="13"
          ry="12"
          fill="hsl(30 50% 10% / 0.45)"
          filter={`url(#${blurId})`}
        />
        <circle cx="25.5" cy="25.5" r="9" fill="#16602a" />
        <g className="pushpin-head">
          <circle cx="22" cy="22" r="14" fill={`url(#${gradientId})`} />
          <ellipse
            cx="16"
            cy="14.5"
            rx="4"
            ry="2.4"
            fill="hsl(0 0% 100% / 0.4)"
            transform="rotate(-35 16 14.5)"
          />
          <path
            d="M22 16.5 V27.5 M16.5 22 H27.5"
            stroke="white"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </button>
  );
}
