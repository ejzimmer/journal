import { LoggedSymptom, MAGNITUDES, SYMPTOMS } from './symptoms';

export type GridPosition = { row: number; column: number };

const STEPS: Record<string, GridPosition> = {
  ArrowUp: { row: -1, column: 0 },
  ArrowDown: { row: 1, column: 0 },
  ArrowLeft: { row: 0, column: -1 },
  ArrowRight: { row: 0, column: 1 },
};

export function isArrowKey(key: string) {
  return key in STEPS;
}

function clamp(value: number, max: number) {
  return Math.min(Math.max(value, 0), max);
}

export function moveGridPosition(position: GridPosition, key: string) {
  const step = STEPS[key];
  return {
    row: clamp(position.row + step.row, SYMPTOMS.length - 1),
    column: clamp(position.column + step.column, MAGNITUDES.length - 1),
  };
}

export function findGridPosition({
  symptom,
  magnitude,
}: LoggedSymptom): GridPosition {
  return {
    row: SYMPTOMS.indexOf(symptom),
    column: MAGNITUDES.indexOf(magnitude),
  };
}
