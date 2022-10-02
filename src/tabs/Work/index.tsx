import {
  Button,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Input,
  List,
  ListItem,
  Textarea,
} from "@chakra-ui/react"
import { Field, Formik, useFormikContext } from "formik"
import { useState } from "react"

// list of items
// can add description
// can include links
// can have checklist
// can reorder items
// can mark as done
// can delete
// can edit title, description, checklist
// save to firebase & fetch from firebase
// distinguish between meetings & tasks
// fetch meeting data from google calendar?

type WorkItem = {
  title: string
  time?: string
  description?: string
}

export function Work() {
  // const { resetForm } = useFormikContext()
  const [items, setItems] = useState<WorkItem[]>([])
  const handleSubmit = (values: any) => {
    setItems((items) => [...items, values])
    // resetForm()
  }

  return (
    <>
      <List>
        {items.map((item) => (
          <ListItem key={item.title}>
            {item.title}
            {item.time}
            {item.description}
          </ListItem>
        ))}
      </List>
      <Formik
        initialValues={{ title: "", time: "", description: "" }}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => <Form onSubmit={handleSubmit} />}
      </Formik>
    </>
  )
}

type FormProps = {
  onSubmit: () => void
}
function Form({ onSubmit }: FormProps) {
  return (
    <form onSubmit={onSubmit}>
      <Grid
        gridTemplateColumns="1fr 1fr"
        gridGap={4}
        maxWidth="600px"
        margin="auto"
      >
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
    </form>
  )
}
