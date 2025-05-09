import { HStack, Input, Select } from "@chakra-ui/react"
import React, { ChangeEvent, FormEvent, useContext, useState } from "react"
import { FirebaseContext } from "../FirebaseContext"
import { Category, COLOURS } from "./types"

interface Props {
  list: string
  showFrequency?: boolean
}

export function NewItem({ list, showFrequency }: Props) {
  const { addItem: addItemToList } = useContext(FirebaseContext)
  const [description, setDescription] = useState("")
  const [type, setType] = useState<Category>("🧹")
  const [frequency, setFrequency] = useState("一回")

  const updateDescription = (event: ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value)
  }
  const updateType = (event: ChangeEvent<HTMLSelectElement>) => {
    setType(event.target.value as Category)
  }
  const updateFrequency = (event: ChangeEvent<HTMLSelectElement>) => {
    setFrequency(event.target.value)
  }

  const submitForm = (event: FormEvent) => {
    event.preventDefault()
    addItemToList(list, { description, type, frequency })
    setDescription("")
  }

  return (
    <form action="#" onSubmit={submitForm}>
      <HStack spacing="4" maxWidth="600px">
        <Select width="120px" onChange={updateType} value={type}>
          {Object.keys(COLOURS).map((category) => (
            <Option value={category} key={category} />
          ))}
        </Select>
        <Input
          variant="flushed"
          onChange={updateDescription}
          value={description}
        />
        {showFrequency && (
          <Select width="140px" onChange={updateFrequency} value={frequency}>
            <Option value="一回" />
            <Option value="毎日" />
            <Option value="平日" />
          </Select>
        )}
      </HStack>
    </form>
  )
}

function Option({ value }: { value: string }) {
  return (
    <option style={{ paddingRight: "70px" }} value={value}>
      {value}
    </option>
  )
}
