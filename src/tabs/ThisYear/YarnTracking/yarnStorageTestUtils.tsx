import { ReactElement } from 'react';
import { render } from '@testing-library/react';
import {
  YarnStorageContext,
  YarnStorageContextType,
  YarnYearStorage,
} from './YarnStorageContext';

export function renderWithYarnStorage(
  ui: ReactElement,
  overrides: Partial<YarnYearStorage> = {},
) {
  const storageContext: YarnYearStorage = {
    yarnByType: undefined,
    year: 2026,
    pile: undefined,
    currentBalance: 0,
    getBalance: () => 0,
    addYarn: jest.fn(),
    removeYarn: jest.fn(),
    ...overrides,
  };
  const contextValue: YarnStorageContextType = {
    years: [storageContext.year],
    thisYear: storageContext.year,
    selectedYear: storageContext.year,
    selectYear: jest.fn(),
    getYarnYear: () => storageContext,
  };
  const result = render(
    <YarnStorageContext.Provider value={contextValue}>
      {ui}
    </YarnStorageContext.Provider>,
  );
  return { ...result, storageContext };
}
