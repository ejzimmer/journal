import { DailyBreakdown } from "./DailyBreakdown"
import { WeeklyCalorieTracker } from "./WeeklyCalorieTracker"

export function Health() {
  return (
    <div>
      <WeeklyCalorieTracker />
      <DailyBreakdown />
    </div>
  )
}
