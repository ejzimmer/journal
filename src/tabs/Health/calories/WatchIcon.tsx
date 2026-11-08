type WatchIconProps = {
  colour: string;
  width: string;
};

export function WatchIcon({ colour, width }: WatchIconProps) {
  return (
    <svg viewBox="0 0 20 20" width={width} aria-hidden="true">
      <path d="M7.5 1H12.5V5H7.5ZM7.5 15H12.5V19H7.5Z" fill={colour} />
      <circle
        cx="10"
        cy="10"
        r="5.4"
        fill="white"
        stroke={colour}
        strokeWidth="1.6"
      />
      <path
        d="M10 10V7M10 10L12.2 11.3"
        fill="none"
        stroke={colour}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
