import React, { useCallback, useId, useRef, useState } from "react"
import { OptionType, ComboboxProps } from "./types"
import { usePopoverState } from "./usePopoverState"
import { SingleValueInput } from "./SingleValueInput"
import { MultiValueInput } from "./MultiValueInput"

import "./Combobox.css"
import { isSelected } from "./utils"
import { Popover } from "./Popover"
import { useClickOutside } from "./useClickOutside"
import { useKeyboardNavigation } from "./useKeyboardNavigation"

export function Combobox<T extends OptionType>({
  isMultiValue,
  value,
  options,
  onChange,
  createOption,
  hideSelectedOptions,
  Option,
  Value,
  label,
}: ComboboxProps<T>) {
  const inputId = useId()
  const containerRef = useRef<HTMLDivElement>(null)

  const popoverId = useId()
  const popoverRef = useRef<HTMLDivElement>(null)
  const { popoverState, hidePopover, showPopover, togglePopover } =
    usePopoverState(popoverRef)

  const [searchTerm, setSearchTerm] = useState("")
  const displayedOptions = (
    searchTerm
      ? options.filter((o) =>
          o.label.toLowerCase().includes(searchTerm.trimStart().toLowerCase()),
        )
      : options
  ).filter((option) => !hideSelectedOptions || !isSelected({ value, option }))

  const { highlightedOption, onArrowKeyDown } = useKeyboardNavigation({
    value: isMultiValue ? undefined : value,
    options: displayedOptions,
    onChange: (selectedOption: T) => {
      if (popoverState !== "open") {
        if (isMultiValue) {
          showPopover()
        } else {
          updateValue(selectedOption)
        }
      }
    },
  })

  const reset = useCallback(
    (alwayClosePopover?: boolean) => {
      if (!isMultiValue || alwayClosePopover) hidePopover()
      setSearchTerm("")
    },
    [hidePopover, isMultiValue],
  )
  useClickOutside({
    elementRef: containerRef,
    onClickOutside: () => reset(true),
    shouldListen: !!containerRef.current,
  })

  const updateValue = (option: T) => {
    if (isMultiValue) {
      const index = value.findIndex((v) => option.id === v.id)
      if (index > -1) {
        onChange(value.toSpliced(index, 1))
      } else {
        onChange([...value, option])
      }
    } else {
      onChange(option)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "Enter":
        event.stopPropagation()
        event.preventDefault()
        if (highlightedOption) {
          updateValue(highlightedOption)
        } else if (isMultiValue && searchTerm) {
          addOption(searchTerm)
        }
        reset()
        break
      case "ArrowDown":
        onArrowKeyDown("down")
        break
      case "ArrowUp":
        onArrowKeyDown("up")
        break
      case "Tab": {
        reset()
        break
      }
      default:
        showPopover()
    }
  }

  const addOption = (label: string) => {
    const existingOption = options.find((o) => o.label === label)
    if (existingOption && isMultiValue && value.includes(existingOption)) {
      return
    }
    updateValue(existingOption ?? createOption(label))
  }

  return (
    <div>
      {label && (
        <label className="label" htmlFor={inputId}>
          {label}
        </label>
      )}

      <div ref={containerRef} className="combobox">
        {isMultiValue ? (
          <MultiValueInput
            value={value}
            onRemoveValue={(v) => updateValue(v)}
            onRemoveAll={() => onChange([])}
            searchInputValue={searchTerm}
            onChangeSearchTerm={(event) => {
              const value = event.target.value ?? ""
              setSearchTerm(value)
            }}
            id={inputId}
            popoverId={popoverId}
            isPopoverOpen={popoverState === "open"}
            onKeyDown={handleKeyDown}
            onClick={togglePopover}
            Value={Value}
          />
        ) : (
          <SingleValueInput
            value={value}
            searchInputValue={searchTerm}
            onChangeSearchTerm={(
              event: React.ChangeEvent<HTMLInputElement>,
            ) => {
              const value = event.target.value ?? ""
              setSearchTerm(value)

              if (value.trim()) {
                addOption(value)
              }
            }}
            id={inputId}
            popoverId={popoverId}
            isPopoverOpen={popoverState === "open"}
            onKeyDown={handleKeyDown}
            onClick={togglePopover}
          >
            {Value && value ? <Value value={value} /> : null}
          </SingleValueInput>
        )}
        <Popover
          popoverRef={popoverRef}
          popoverId={popoverId}
          options={displayedOptions}
          selected={value}
          onClick={(option) => {
            updateValue(option)
            reset()
          }}
          highlightedOption={highlightedOption}
          Option={Option}
        />
      </div>
    </div>
  )
}
