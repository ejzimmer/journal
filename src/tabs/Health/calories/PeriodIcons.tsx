import { BloodDropIcon } from "../../../shared/icons/BloodDrop"
import { BloodDropsIcon } from "../../../shared/icons/BloodDrops"
import { LightningBoltIcon } from "../../../shared/icons/LightningBolt"
import "./PeriodIcons.css"

export const LIGHT_FLOW = "🟤"
export const HEAVY_FLOW = "🔴"
export const OVARY_PAIN = "🥚"

export function PeriodIcons({ trackers }: { trackers?: string[] }) {
  if (!trackers?.length) {
    return null
  }

  return (
    <div className="period-icons">
      {trackers.includes(LIGHT_FLOW) && (
        <span role="img" aria-label="light flow">
          <BloodDropIcon width="6px" />
        </span>
      )}
      {trackers.includes(HEAVY_FLOW) && (
        <span role="img" aria-label="heavy flow">
          <BloodDropsIcon width="9px" />
        </span>
      )}
      {trackers.includes(OVARY_PAIN) && (
        <span role="img" aria-label="ovary pain">
          <LightningBoltIcon width="6px" />
        </span>
      )}
    </div>
  )
}
