import { Input } from "@chakra-ui/input"
import { Td, Tfoot, Tr } from "@chakra-ui/table"
import { FormEvent, useRef } from "react"

interface Props {
  addHabit: (habitName: string) => void
}

export function AddHabitFooter({ addHabit }: Props) {
  const newHabit = useRef<HTMLInputElement>(null)

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const habitName = newHabit.current?.value
    if (habitName) {
      addHabit(habitName)
      newHabit.current.value = ""
    }
  }

  return (
    <Tfoot>
      <Tr>
        <Td colSpan={8} borderWidth="0">
          <form action="#" onSubmit={onSubmit}>
            <Input variant="flushed" ref={newHabit} width="40ch" />
          </form>
        </Td>
      </Tr>
    </Tfoot>
  )
}
