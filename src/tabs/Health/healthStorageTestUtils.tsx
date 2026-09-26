import { ReactElement } from 'react';
import { render } from '@testing-library/react';
import {
  HealthStorageContext,
  HealthStorageContextType,
} from './HealthStorageContext';

export function createHealthStorageContext(
  overrides: Partial<HealthStorageContextType> = {},
): HealthStorageContextType {
  return {
    days: undefined,
    exercises: [],
    classes: [],
    isLoading: false,
    updateDay: jest.fn(),
    addExercise: jest.fn(),
    recordExercise: jest.fn(),
    updateClass: jest.fn(),
    ...overrides,
  };
}

export function renderWithHealthStorage(
  ui: ReactElement,
  overrides: Partial<HealthStorageContextType> = {},
) {
  const storageContext = createHealthStorageContext(overrides);
  const result = render(
    <HealthStorageContext.Provider value={storageContext}>
      {ui}
    </HealthStorageContext.Provider>,
  );
  return { ...result, storageContext };
}
