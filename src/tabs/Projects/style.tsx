import { Input } from "@chakra-ui/react"
import styled from "@emotion/styled"

export const EditableLabel = styled(Input)`
  border: none;
  --active-background: hsl(0 0% 100% / 0.5);
  &:hover {
    background: var(--active-background);
  }
  &:focus {
    background: var(--active-background);
    box-shadow: none;
  }
`
