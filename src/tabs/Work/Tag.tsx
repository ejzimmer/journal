import { Box } from "@chakra-ui/react"

export function Tag({ text, colour }: { text: string; colour: string }) {
  return (
    <Box
      fontFamily="sans-serif"
      backgroundColor={colour}
      padding="4px 8px"
      borderRadius="3px"
      fontSize="16px"
      color="white"
      width="fit-content"
    >
      {text}
    </Box>
  )
}

export const TAG_COLOURS = [
  "hsl(182.8, 91.5%, 72.2%)",
  "hsl(109.8, 91.5%, 72.2%)",
  "hsl(41.8, 87.5%, 74.9%)",
  "hsl(284, 82.4%, 82.2%)",
  "hsl(50.7, 88%, 64.1%)",
]
