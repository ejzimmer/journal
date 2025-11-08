import { useEffect, useId, useMemo, useRef, useState } from "react"

import "./Combobox.css"
import { Dropdown } from "./Dropdown"
import { OptionBase } from "./types"
import { MultiSelectInput } from "./MultiSelectInput"
import { SingleSelectValue } from "./SingleSelectInput"

type BaseProps<T> = {
  label: string
  options: T[]
  createOption: (text: string) => T
  Option?: React.FC<{ option: T; children?: React.ReactNode }>
}
type SingleSelectProps<T> = BaseProps<T> & {
  allowMulti?: false
  value: T | undefined
  onChange: (value: T) => void
}
type MultiSelectProps<T> = BaseProps<T> & {
  allowMulti: true
  value: T[]
  onChange: (value: T[]) => void
}

export type ComboboxProps<T extends OptionBase> =
  | SingleSelectProps<T>
  | MultiSelectProps<T>

export function Combobox<T extends OptionBase>({
  value,
  onChange,
  label,
  options,
  createOption,
  allowMulti,
  Option,
}: ComboboxProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPopoutOpen, setPopoutOpen] = useState(false)

  const popoutId = useId()
  const [searchText, setSearchText] = useState("")
  const [interactionMode, setInteractionMode] = useState<"search" | "scroll">(
    "search"
  )

  const unselectedOptions = useMemo(
    () =>
      Array.isArray(value)
        ? options.filter((o) => !listContainsOption(value, o))
        : options,
    [options, value]
  )
  const displayedOptions = useMemo(() => {
    const searchTerm = searchText.trimStart().toLowerCase()
    return searchTerm
      ? unselectedOptions.filter((o) =>
          o.text.toLowerCase().includes(searchTerm)
        )
      : unselectedOptions
  }, [unselectedOptions, searchText])

  const handleEnter = (text: string) => {
    const existingOption = options.find((o) => o.text === text)
    const option = existingOption ?? createOption(text)

    handleChange(option)
    setSearchText("")
  }

  const handleChange = (option: T) => {
    // Don't add the option if it's already in the value
    if (allowMulti && !listContainsOption(value, option)) {
      onChange([...value, option])
    } else if (!allowMulti) {
      onChange(option)
      setPopoutOpen(false)
    }
    setSearchText("")
  }

  const handleInputKeyDown = (event: React.KeyboardEvent) => {
    const key = event.key

    switch (key) {
      case "Enter":
        if (interactionMode === "search" && searchText.trim()) {
          handleEnter(searchText.trim())
        }
        break
      case " ":
        if (interactionMode === "search") {
          event.stopPropagation()
        } else {
          event.preventDefault()
        }
        break
      case "ArrowDown":
        if (!isPopoutOpen) {
          setPopoutOpen(true)
        }
        setInteractionMode("scroll")
        break
      case "ArrowUp":
        setInteractionMode("scroll")
        if (!isPopoutOpen) {
          setPopoutOpen(true)
        }
        break
      default:
        setInteractionMode("search")
    }
  }

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setPopoutOpen(false)
      }
    }
    window.addEventListener("click", onClick)

    return () => window.removeEventListener("click", onClick)
  }, [])

  return (
    <div ref={containerRef}>
      <Dropdown
        isPopoutOpen={isPopoutOpen}
        onClick={handleChange}
        options={displayedOptions}
        Option={Option}
        id={popoutId}
      >
        {allowMulti ? (
          <MultiSelectInput
            label={label}
            value={value}
            onKeyDown={handleInputKeyDown}
            inputValue={searchText}
            onChangeInputValue={setSearchText}
            onFocus={() => setPopoutOpen(true)}
            popoutId={popoutId}
            isPopoutOpen={isPopoutOpen}
            onChange={onChange}
          />
        ) : (
          <SingleSelectValue
            label={label}
            value={value}
            inputValue={searchText}
            onChangeInputValue={setSearchText}
            onKeyDown={handleInputKeyDown}
            popoutId={popoutId}
            isPopoutOpen={isPopoutOpen}
            onFocus={() => setPopoutOpen(true)}
          />
        )}
      </Dropdown>
    </div>
  )
}

const listContainsOption = (list: OptionBase[], option: OptionBase) =>
  list.find((v) => v.text === option.text)
