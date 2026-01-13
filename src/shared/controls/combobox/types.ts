import React, { ReactNode } from "react"

export type OptionType = {
  id: string
  label: string
}

type BaseProps<T> = {
  options: T[]
  createOption: (label: string) => T
  hideSelectedOptions?: boolean
  Option?: React.FC<{ value: T }>
  Value?: MultiValueInputProps<T>["Value"]
  label?: string
}
type SingleValueProps<T> = BaseProps<T> & {
  isMultiValue?: false
  value: T | undefined
  onChange: (value: T) => void
}

export type SingleValueInputProps<T> = {
  value?: T
  searchInputValue: string
  onChangeSearchTerm: (event: React.ChangeEvent<HTMLInputElement>) => void
  children: ReactNode
} & Omit<SearchInputProps, "value" | "onChange">

type MultiValueProps<T> = BaseProps<T> & {
  isMultiValue: true
  value: T[]
  onChange: (value: T[]) => void
}

export type MultiValueInputProps<T> = {
  value: T[]
  onRemoveValue: (value: T) => void
  onRemoveAll: () => void
  searchInputValue: SearchInputProps["value"]
  onChangeSearchTerm: (event: React.ChangeEvent<HTMLInputElement>) => void
  Value?: React.FC<{ value: T; children?: React.ReactElement }>
} & Omit<SearchInputProps, "value" | "onChange">

export type SearchInputProps = {
  id: string
  value: string
  popoverId: string
  isPopoverOpen: boolean
  onKeyDown: (event: React.KeyboardEvent) => void
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onClick: (event: React.MouseEvent) => void
}

export type ComboboxProps<T extends OptionType> =
  | SingleValueProps<T>
  | MultiValueProps<T>
