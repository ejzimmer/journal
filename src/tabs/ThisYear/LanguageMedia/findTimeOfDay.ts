export type TimeOfDay = 'night' | 'dawn' | 'day' | 'dusk';

export function findTimeOfDay(hour: number): TimeOfDay {
  if (hour < 5 || hour >= 20) return 'night';
  if (hour < 7) return 'dawn';
  if (hour < 18) return 'day';
  return 'dusk';
}
