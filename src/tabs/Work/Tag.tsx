import { Box, IconButton } from "@chakra-ui/react"
import { useState } from "react"

export function Tag({
  text,
  colour,
  onDelete,
}: {
  text: string
  colour: string
  onDelete: () => void
}) {
  const [closeButtonVisible, setCloseButtonVisible] = useState(false)
  const showCloseButton = () => setCloseButtonVisible(true)
  const hideCloseButton = () => setCloseButtonVisible(false)

  return (
    <Box
      position="relative"
      onMouseEnter={showCloseButton}
      onMouseLeave={hideCloseButton}
    >
      <Box
        fontFamily="sans-serif"
        backgroundColor={colour}
        padding="4px 8px"
        borderRadius="3px"
        fontSize="16px"
        color="white"
        width="fit-content"
        transition="opacity .2sx"
        sx={{
          ":has(+ :hover)": {
            opacity: 0.6,
          },
        }}
      >
        {text}
      </Box>
      <IconButton
        aria-label={`Delete label ${text}`}
        isRound
        variant="outline"
        icon={<XIcon />}
        size="xs"
        position="absolute"
        insetInlineEnd={0}
        insetBlockStart={0}
        transform="translate(50%,-35%)"
        color={colour}
        padding="2px"
        borderColor={colour}
        backgroundColor="white"
        _hover={{
          borderColor: "white",
          backgroundColor: colour,
          color: "white",
        }}
        transition="all .2s"
        opacity={closeButtonVisible ? 1 : 0}
        onClick={onDelete}
      />
    </Box>
  )
}

export function XIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M5,5 L15,15" />
      <path d="M15,5 L5,15" />
    </svg>
  )
}

export const TAG_COLOURS = [
  "hsl(182.8, 91.5%, 72.2%)",
  "hsl(109.8, 91.5%, 72.2%)",
  "hsl(41.8, 87.5%, 74.9%)",
  "hsl(284, 82.4%, 82.2%)",
  "hsl(50.7, 88%, 64.1%)",
]
