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
    yarnTypes: undefined,
    recordBalance: jest.fn(),
    ...overrides,
  };
  const result = render(
    <YarnStorageContext.Provider value={storageContext}>
      {ui}
    </YarnStorageContext.Provider>,
  );
  return { ...result, storageContext };
}
