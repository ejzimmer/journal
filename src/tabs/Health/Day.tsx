import { Flex, Heading } from "@chakra-ui/react"
import { format } from "date-fns"
import { useState } from "react"
import { BooleanTracker } from "./BooleanTracker"
import { InputTracker } from "./InputTracker"
import { MultistateTracker } from "./MultistateTracker"
import { Trackers, Tracker } from "./types"

const TRACKERS: Trackers = {
  stretch: { type: "boolean", id: "stretch", label: "🧘🏽", isChecked: false },
  calories: { type: "boolean", id: "calories", label: "⚖️", isChecked: false },
  teeth: { type: "boolean", id: "teeth", label: "🦷", isChecked: false },
  drinks: {
    type: "multistate",
    id: "drinks",
    options: ["🫖", "🍺", "🍻"],
    value: "🫖",
  },
  period: {
    type: "multistate",
    id: "period",
    options: ["⚪", "🐞", "🔴"],
    value: "⚪",
  },
  waist: { type: "input", id: "waist", value: "86" },
}

type UpdateTracker = (tracker: Tracker, key: string, value: any) => void

type Props = {
  date: Date
}
export function Day({ date }: Props) {
  const [state, setState] = useState(TRACKERS)

  const updateTracker: UpdateTracker = (tracker, key, value) => {
    setState((state) => ({
      ...state,
      [tracker.id]: {
        ...tracker,
        [key]: value,
      },
    }))
  }

  const trackers = mapTrackers(state, updateTracker)

  return (
    <Flex
      border="2px solid"
      borderColor="gray.300"
      borderRadius="50%"
      width="min-content"
      direction="column"
      alignItems="center"
      fontSize="24px"
      padding="8px"
      position="relative"
    >
      <Heading
        as="h3"
        fontSize="16px"
        position="absolute"
        top="0"
        transform="translateY(-40%)"
        fontWeight="medium"
        background="linear-gradient(transparent, white, transparent)"
        px="4px"
        py="0"
        color="gray.600"
      >
        {format(date, "d")}
      </Heading>
      <Flex>{trackers.slice(0, 2)}</Flex>
      <Flex>{trackers.slice(2, 5)}</Flex>
      <Flex>{trackers.slice(5)}</Flex>
    </Flex>
  )
}

function mapTrackers(trackers: Trackers, updateTracker: UpdateTracker) {
  return Object.values(trackers).map((tracker) => {
    switch (tracker.type) {
      case "boolean":
        return (
          <BooleanTracker
            key={tracker.id}
            isChecked={tracker.isChecked}
            onChange={(isChecked) =>
              updateTracker(tracker, "isChecked", isChecked)
            }
          >
            {tracker.label}
          </BooleanTracker>
        )
      case "multistate":
        return (
          <MultistateTracker
            key={tracker.id}
            name={tracker.id}
            options={tracker.options}
            value={tracker.value}
            onChange={(value) => updateTracker(tracker, "value", value)}
          />
        )
      case "input":
        return (
          <InputTracker
            key={tracker.id}
            value={tracker.value}
            onChange={(value) => updateTracker(tracker, "value", value)}
          />
        )
      default:
        return null
    }
  })
}
