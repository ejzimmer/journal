import { Button, Input } from "@chakra-ui/react"
import styled from "@emotion/styled"

export const EditableLabel = styled(Input)`
  border: none;
  --active-background: hsl(0 0% 100% / 0.5);
  height: var(--input-height);
  &:hover {
    background: var(--active-background);
  }
  &:focus {
    background: var(--active-background);
    box-shadow: none;
  }
`

export const ColouredButton = styled(Button)(({ colour }) => ({
  background: "transparent",
  border: "2px solid",
  borderColor: `color-mix(
    in hsl shorter hue,
    ${colour},
    hsl(300 0% 25%)
  )`,
  height: "var(--input-height)",
  fontWeight: "normal",

  "&:hover": {
    background: `color-mix(in hsl shorter hue, ${colour}, hsl(300 0% 60%))`,
  },
  "&:active": {
    background: `color-mix(in hsl shorter hue, ${colour}, hsl(300 0% 40%))`,
  },
}))
