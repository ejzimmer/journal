import { HStack, Input, Select } from "@chakra-ui/react"
import styled from "@emotion/styled"
import { ChangeEvent, FormEvent, useContext, useState } from "react"
import { FirebaseContext } from "../FirebaseContext"

interface Props {
  list: string
}

export function NewItem({ list }: Props) {
  const { addItemToList } = useContext(FirebaseContext)
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
    addItemToList(list, { description, type })
    setDescription("")
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
