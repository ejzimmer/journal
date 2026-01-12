import { OptionType } from "./types"

export const isSelected = <T extends OptionType>({
  value,
  option,
}: {
  value?: T | T[]
  option: T
}): boolean => {
  if (Array.isArray(value)) {
    return !!value.find((v) => v.id === option.id)
  } else {
    return value?.id === option.id
  }
}
