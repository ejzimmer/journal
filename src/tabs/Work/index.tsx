import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Input,
  List,
  ListItem,
  RadioGroup,
  Textarea,
  useRadio,
  useRadioGroup,
  UseRadioProps,
} from "@chakra-ui/react"
import { Field, Form, Formik, FormikHelpers } from "formik"
import React, { PropsWithChildren, useState } from "react"

// distinguish between meetings & tasks
// list of items
// can edit all fields
// can add description later
// can include links in description
// can have checklists in description
// can mark as done
// can delete
// save to firebase & fetch from firebase
// fetch meeting data from google calendar?
// can reorder items

type ItemType = "meeting" | "task"

interface WorkItem {
  title: string
  type: ItemType
}

interface Meeting extends WorkItem {
  type: "meeting"
  time: string
}
interface Task extends WorkItem {
  type: "task"
  description: string
}

export function Work() {
  const [items, setItems] = useState<WorkItem[]>([])
  const handleSubmit = (values: any, { resetForm }: FormikHelpers<any>) => {
    setItems((items) => [...items, values])
    resetForm()
  }

  return (
    <>
      <List>
        {items.map((item) => (
          <ListItem key={item.title}>{item.title}</ListItem>
        ))}
      </List>
      <Formik
        initialValues={{ title: "", time: "", description: "" }}
        onSubmit={handleSubmit}
      >
        <AddWorkItemForm />
      </Formik>
    </>
  )
}

function RadioSwitch(props: PropsWithChildren<UseRadioProps>) {
  const { getInputProps, getCheckboxProps } = useRadio(props)

  const input = getInputProps()
  const checkbox = getCheckboxProps()

  return (
    <Box
      as="label"
      _first={{
        borderLeftRadius: "full",
      }}
      _last={{
        borderRightRadius: "full",
      }}
    >
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        borderWidth="1px"
        borderRadius="inherit"
        boxShadow="md"
        color="gray.500"
        _checked={{
          bg: "green.400",
          color: "white",
          borderColor: "green.400",
          boxShadow: "inset var(--chakra-shadows-md)",
        }}
        _focus={{
          outline: "1px dashed currentColor",
        }}
        transition="box-shadow 0.3s"
        px={5}
        py={3}
      >
        {props.children}
      </Box>
    </Box>
  )
}
function AddWorkItemForm() {
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "type",
    defaultValue: "meeting",
    onChange: console.log,
  })

  const group = getRootProps()

  return (
    <Form>
      <Grid
        gridTemplateColumns="1fr 1fr"
        gridGap={4}
        maxWidth="600px"
        margin="auto"
      >
        <HStack {...group} spacing="0">
          <RadioSwitch {...getRadioProps({ value: "meeting" })}>
            Meeting
          </RadioSwitch>
          <RadioSwitch {...getRadioProps({ value: "task" })}>Task</RadioSwitch>
        </HStack>
        <FormControl>
          <FormLabel>Title</FormLabel>
          <Field as={Input} name="title" />
        </FormControl>
        <FormControl>
          <FormLabel>Time</FormLabel>
          <Field as={Input} name="time" />
        </FormControl>
        <GridItem colSpan={2}>
          <FormControl>
            <FormLabel>Description</FormLabel>
            <Field as={Textarea} name="description" />
          </FormControl>
        </GridItem>
        <Button type="submit">Add item</Button>
      </Grid>
    </Form>
  )
}
