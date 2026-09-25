import { ReactElement } from 'react';
import { render } from '@testing-library/react';
import {
  YarnStorageContext,
  YarnStorageContextType,
} from './YarnStorageContext';

export function renderWithYarnStorage(
  ui: ReactElement,
  overrides: Partial<YarnStorageContextType> = {},
) {
  const storageContext: YarnStorageContextType = {
    yarnByType: undefined,
    pile: undefined,
    currentBalance: 0,
    getBalance: () => 0,
    addYarn: jest.fn(),
    removeYarn: jest.fn(),
    ...overrides,
  };
  const result = render(
    <YarnStorageContext.Provider value={storageContext}>
      {ui}
    </YarnStorageContext.Provider>,
  );
  return { ...result, storageContext };
}
