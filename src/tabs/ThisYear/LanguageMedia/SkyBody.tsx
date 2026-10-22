import { ArcPosition } from './findArcPosition';

type SkyBodyProps = {
  className: string;
  position: ArcPosition;
};

export function SkyBody({ className, position }: SkyBodyProps) {
  return (
    <div
      className={`sky-body ${className}`}
      style={{
        insetInlineStart: `calc(${position.across} * (100% - var(--body-size)))`,
        insetBlockStart: `calc(16px + ${1 - position.height} * (100% - 16px - var(--body-size) / 2))`,
      }}
    />
  );
}
