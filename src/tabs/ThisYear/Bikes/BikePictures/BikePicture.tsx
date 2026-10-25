import { ReactNode } from 'react';

type BikePictureProps = { children: ReactNode };

export function BikePicture({ children }: BikePictureProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}
