import { BoxProps, Flex, Heading } from "@chakra-ui/react"
import { countCompleted, NO_COMPLETABLE_TRACKERS } from "../../shared/utilities"
import { BooleanTracker } from "./BooleanTracker"
import { InputTracker } from "./InputTracker"
import { MultistateTracker } from "./MultistateTracker"
import { Trackers, Tracker } from "./types"

type UpdateTracker = (tracker: Tracker, key: string, value: any) => void

interface Props extends Omit<BoxProps, "onChange"> {
  day: string
  trackers: Trackers
  onChange: (trackers: Trackers, day: string) => void
  hue?: number
}
export function Day({ day, trackers, onChange, hue, ...rest }: Props) {
  const updateTracker: UpdateTracker = (tracker, key, value) => {
    onChange(
      {
        ...trackers,
        [tracker.id]: {
          ...tracker,
          [key]: value,
        },
      },
      day
    )
  }

  const mapTracker = (tracker: Tracker) =>
    getTracker(day, tracker, updateTracker)

  const isCompleted = countCompleted(trackers) === NO_COMPLETABLE_TRACKERS
  const borderColour = `hsl(${hue} ${isCompleted ? "50%" : "0%"} 50% / ${
    isCompleted ? "1" : "0.3"
  })`

  return (
    <Flex
      border="2px solid"
      borderColor={borderColour}
      borderRadius="50%"
      width="min-content"
      direction="column"
      alignItems="center"
      fontSize="24px"
      padding="8px"
      position="relative"
      flexShrink="0"
      {...rest}
    >
      <Heading
        as="h3"
        fontSize="16px"
        position="absolute"
        top="0"
        transform="translateY(-40%)"
        fontWeight="medium"
        background="white"
        px="4px"
        py="0"
        color="gray.600"
      >
        {day}
      </Heading>
      <Flex>
        {mapTracker(trackers.stretch)} {mapTracker(trackers.calories)}
      </Flex>
      <Flex>
        {mapTracker(trackers.teeth)} {mapTracker(trackers.drinks)}{" "}
        {mapTracker(trackers.period)}
      </Flex>
      <Flex>{mapTracker(trackers.waist)}</Flex>
    </Flex>
  )
}

function getTracker(
  day: string,
  tracker: Tracker,
  updateTracker: UpdateTracker
) {
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
          name={tracker.id + day}
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
}