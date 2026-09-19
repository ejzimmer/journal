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

export const findBestMatch = <T extends OptionType>(
  options: T[],
  searchTerm: string
): T | undefined => {
  const search = searchTerm.trim().toLowerCase()
  if (!search) return undefined

  return (
    options.find((option) => option.label.toLowerCase() === search) ?? options[0]
  )
}
