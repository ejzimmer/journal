import { useId } from 'react';

export function CrochetIcon() {
  const handleHoleMaskId = useId();

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <mask
        id={handleHoleMaskId}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="24"
        height="24"
      >
        <rect width="24" height="24" fill="white" stroke="none" />
        <circle cx="5.4" cy="18.6" r="0.8" fill="black" stroke="none" />
      </mask>
      <path
        d="M4.4 19.6L11 13"
        strokeWidth="4.4"
        mask={`url(#${handleHoleMaskId})`}
      />
      <path
        d="M11 13L18.6 5.4Q19.6 4.4 20.6 4.4Q21.4 4.6 21.2 5.8"
        strokeWidth="1.7"
      />
    </svg>
  );
}
