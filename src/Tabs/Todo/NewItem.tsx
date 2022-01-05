import { HStack, Input, Select } from "@chakra-ui/react"
import styled from "@emotion/styled"
import { ChangeEvent, FormEvent, useState } from "react"
import { Item } from "./types"

interface Props {
  addItem: (item: Item) => void
}

export function NewItem({ addItem }: Props) {
  const [description, setDescription] = useState("")
  const [type, setType] = useState("🧹")

  const updateDescription = (event: ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value)
  }
  const updateType = (event: ChangeEvent<HTMLSelectElement>) => {
    setType(event.target.value)
  }

  const submitForm = (event: FormEvent) => {
    event.preventDefault()
    addItem({ description, type })
    setDescription("")
    setType("🧹")
  }

  return (
    <form action="#" onSubmit={submitForm}>
      <HStack spacing="4" maxWidth="600px">
        <Select width="max-content" onChange={updateType} value={type}>
          <Option value="🧹">chore 🧹</Option>
          <Option value="⚒️">work ⚒️</Option>
          <Option value="💰">finance 💰</Option>
          <Option value="🪡">sewing 🪡</Option>
          <Option value="🧶">yarn 🧶</Option>
          <Option value="🖌️">art 🖌️</Option>
          <Option value="📓">learning 📓</Option>
          <Option value="👾">games 👾</Option>
          <Option value="🖋️">writing 🖋️</Option>
          <Option value="👩‍💻">coding 👩‍💻</Option>
        </Select>
        <Input
          variant="flushed"
          onChange={updateDescription}
          value={description}
        />
      </HStack>
    </form>
  )
}

const Option = styled.option`
  padding-right: 40px;
`
