export function XIcon({ width = "100%" }: { width?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      width={width}
    >
      <path d="M5,5 L15,15" />
      <path d="M15,5 L5,15" />
    </svg>
  )
}
