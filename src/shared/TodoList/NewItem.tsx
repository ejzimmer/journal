import { HStack, Input, Radio, RadioGroup, Select } from "@chakra-ui/react"
import styled from "@emotion/styled"
import { ChangeEvent, FormEvent, useContext, useState } from "react"
import { FirebaseContext } from "../FirebaseContext"

interface Props {
  list: string
  showFrequency?: boolean
}

export function NewItem({ list, showFrequency }: Props) {
  const { addItemToList } = useContext(FirebaseContext)
  const [description, setDescription] = useState("")
  const [type, setType] = useState("🧹")
  const [frequency, setFrequency] = useState("一回")

  const updateDescription = (event: ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value)
  }
  const updateType = (event: ChangeEvent<HTMLSelectElement>) => {
    setType(event.target.value)
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
        {showFrequency && (
          <Select
            width="max-content"
            onChange={updateFrequency}
            value={frequency}
          >
            <Option value="一回">一回</Option>
            <Option value="毎日">毎日</Option>
            <Option value="平日">平日</Option>
          </Select>
        )}
      </HStack>
    </form>
  )
}

const Option = styled.option`
  padding-right: 70px;
`
