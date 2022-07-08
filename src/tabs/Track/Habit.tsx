import { Td, Th } from "@chakra-ui/table"
import { format, isSameDay } from "date-fns"
import { HabitRecord } from "./types"
import { ChangeEvent, ChangeEventHandler, useEffect, useState } from "react"
import { CloseIcon } from "@chakra-ui/icons"
import { Box, FormLabel, IconButton, VisuallyHidden } from "@chakra-ui/react"
import { ConfirmDelete } from "../../shared/ConfirmDelete"

interface Props {
  habit: HabitRecord
  days: Date[]
  onChange: (habit: HabitRecord) => void
  onDelete: (habit: HabitRecord) => void
}

export function Habit({ habit, days, onChange, onDelete }: Props) {
  const [showConfirmation, setShowConfirmation] = useState(false)

  const updateDays = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked: isChecked, value } = event.target
    const day = Number.parseInt(value)
    const days = habit.days || []

    if (isChecked) {
      onChange({ ...habit, days: [...days, day].sort() })
    } else {
      onChange({ ...habit, days: days.filter((d) => !isSameDay(d, day)) })
    }
  }

  return (
    <>
      <Th>{habit.name}</Th>
      {days.map((day) => (
        <Td key={formatDate(day)} textAlign="center" p="0">
          {/* <Checkbox
            value={day.getTime()}
            onChange={updateDays}
            isChecked={listIncludesDay(habit.days, day)}
          /> */}
          <MultiStateCheckboxGroup
            name={`${habit.name}-${day.getTime()}`}
            states={["⬜", "✅", "❌"]}
          />
        </Td>
      ))}
      <Td>
        <IconButton
          variant="ghost"
          color="gray.400"
          _hover={{
            color: "red.500",
          }}
          icon={<CloseIcon />}
          aria-label="delete habit"
          onClick={() => setShowConfirmation(true)}
        />
        <ConfirmDelete
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onDelete={() => onDelete(habit)}
        />{" "}
      </Td>
    </>
  )
}

const formatDate = (date: Date) => format(date, "yyyy-MM-dd")
const listIncludesDay = (list: number[] = [], day: Date) =>
  list.some((d) => isSameDay(d, day))

function MultiStateCheckboxGroup({
  name,
  states,
}: {
  name: string
  states: string[]
}) {
  const [state, setState] = useState(states[0])

  const handleClick: ChangeEventHandler<HTMLInputElement> = (event) => {
    setState(event.target.value)
  }

  return (
    <Box
      as="fieldset"
      __css={{
        label: { display: "none" },
        "input:checked + label": { display: "revert" },
      }}
    >
      {states.map((value, index) => (
        <MultiStateCheckbox
          htmlFor={states[(index + 1) % states.length]}
          isChecked={state === value}
          name={name}
          onChange={handleClick}
          value={value}
        />
      ))}
    </Box>
  )
}

function MultiStateCheckbox({
  name,
  value,
  isChecked,
  onChange,
  htmlFor,
}: {
  name: string
  value: string
  isChecked: boolean
  onChange: ChangeEventHandler<HTMLInputElement>
  htmlFor: string
}) {
  return (
    <>
      <VisuallyHidden
        as="input"
        type="radio"
        id={`${name}-${value}`}
        name={name}
        value={value}
        checked={isChecked}
        onChange={onChange}
      />
      <FormLabel cursor="pointer" htmlFor={`${name}-${htmlFor}`}>
        {value}
      </FormLabel>
    </>
  )
}
