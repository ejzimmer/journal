export type OptionType = {
  id: string
  label: string
}

type BaseProps<T> = {
  options: T[]
  createOption: (label: string) => T
  hideSelectedOptions?: boolean
  Option?: React.FC<{ option: T }>
}
type SingleValueProps<T> = BaseProps<T> & {
  isMultiValue?: false
  value: T | undefined
  onChange: (value: T) => void
}
type MultiValueProps<T> = BaseProps<T> & {
  isMultiValue: true
  value: T[]
  onChange: (value: T[]) => void
}

export type ComboboxProps<T extends OptionType> =
  | SingleValueProps<T>
  | MultiValueProps<T>
