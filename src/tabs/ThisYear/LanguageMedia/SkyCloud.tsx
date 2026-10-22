type SkyCloudProps = {
  x: string;
  y: string;
  scale: number;
};

export function SkyCloud({ x, y, scale }: SkyCloudProps) {
  return (
    <svg
      className="sky-cloud"
      viewBox="-56 -32 112 44"
      width={112 * scale}
      style={{ insetInlineStart: x, insetBlockStart: y }}
    >
      <path d="M-40 10C-56 10-56-10-38-10C-36-26-14-30-4-18C4-34 32-30 32-12C50-14 54 10 36 10Z" />
    </svg>
  );
}
