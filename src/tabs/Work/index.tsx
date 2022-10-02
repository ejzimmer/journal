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
import { useRef, useState } from "react"

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
  const [items, setItems] = useState<WorkItem[]>([])

  const titleRef = useRef<HTMLInputElement>(null)
  const timeRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)

  const onSubmit = () => {
    if (!titleRef.current?.value) {
      return
    }

    const newItem = {
      title: titleRef.current.value,
      time: timeRef.current?.value,
      description: descriptionRef.current?.value,
    }

    setItems((items) => [...items, newItem])
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
      <Grid
        as="form"
        gridTemplateColumns="1fr 1fr"
        gridGap={4}
        maxWidth="600px"
        margin="auto"
        onSubmit={onSubmit}
      >
        <FormControl>
          <FormLabel>Title</FormLabel>
          <Input ref={titleRef} />
        </FormControl>
        <FormControl>
          <FormLabel>Time</FormLabel>
          <Input ref={timeRef} />
        </FormControl>

        <GridItem colSpan={2}>
          <FormControl>
            <FormLabel>Description</FormLabel>
            <Textarea ref={descriptionRef} />
          </FormControl>
        </GridItem>
        <Button>Add item</Button>
      </Grid>
    </>
  )
}
