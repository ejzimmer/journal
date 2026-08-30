import { BloodDropIcon } from "../../../shared/icons/BloodDrop"
import { BloodDropsIcon } from "../../../shared/icons/BloodDrops"
import { LightningBoltIcon } from "../../../shared/icons/LightningBolt"
import { HEAVY_FLOW, LIGHT_FLOW, OVARY_PAIN } from "./PeriodIcons"
import "./PeriodCheckboxes.css"

const TRACKERS = [
  { emoji: LIGHT_FLOW, label: "light flow", Icon: BloodDropIcon, width: "18px" },
  { emoji: HEAVY_FLOW, label: "heavy flow", Icon: BloodDropsIcon, width: "23px" },
  { emoji: OVARY_PAIN, label: "ovary pain", Icon: LightningBoltIcon, width: "18px" },
]

type PeriodCheckboxesProps = {
  trackers: string[]
  onChange: (trackers: string[]) => void
}

export function PeriodCheckboxes({ trackers, onChange }: PeriodCheckboxesProps) {
  const toggle = (emoji: string) => {
    onChange(
      trackers.includes(emoji)
        ? trackers.filter((tracker) => tracker !== emoji)
        : [...trackers, emoji],
    )
  }

  return (
    <div className="period-checkboxes">
      {TRACKERS.map(({ emoji, label, Icon, width }) => (
        <label key={emoji} className="period-checkbox">
          <input
            type="checkbox"
            aria-label={label}
            checked={trackers.includes(emoji)}
            onChange={() => toggle(emoji)}
          />
          <Icon width={width} />
        </label>
      ))}
    </div>
  )
}
