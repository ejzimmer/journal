type MoreIconProps = {
  hiddenCount: number;
  iconSize: number;
};

export function MoreIcon({ hiddenCount, iconSize }: MoreIconProps) {
  return (
    <span role="img" aria-label={`${hiddenCount} more`} className="more-icon">
      <svg
        viewBox="5 7.5 10 5"
        width={`${iconSize / 2}px`}
        height={`${iconSize / 4}px`}
        aria-hidden="true"
      >
        <circle cx="6.8" cy="10" r="1.3" />
        <circle cx="10" cy="10" r="1.3" />
        <circle cx="13.2" cy="10" r="1.3" />
      </svg>
    </span>
  );
}
