export type WeeklyProgress = {
  numberDone: number;
  frequency: number;
  label: string;
  isDue: boolean;
  fillOpacity: number;
  onAdd: () => void;
  onRemove: () => void;
};
