import { ReactElement } from 'react';
import { render } from '@testing-library/react';
import {
  LanguageMediaStorageContext,
  LanguageMediaStorageContextType,
} from './LanguageMediaStorageContext';

export function renderWithLanguageMediaStorage(
  ui: ReactElement,
  overrides: Partial<LanguageMediaStorageContextType> = {},
) {
  const storageContext: LanguageMediaStorageContextType = {
    media: [],
    isLoading: false,
    addMedia: jest.fn(),
    updateMedia: jest.fn(),
    deleteMedia: jest.fn(),
    ...overrides,
  };
  const result = render(
    <LanguageMediaStorageContext.Provider value={storageContext}>
      {ui}
    </LanguageMediaStorageContext.Provider>,
  );
  return { ...result, storageContext };
}
