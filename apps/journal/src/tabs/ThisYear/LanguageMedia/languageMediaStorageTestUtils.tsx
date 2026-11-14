import { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import {
  LanguageMediaStorageContext,
  LanguageMediaStorageContextType,
  LanguageMediaYearStorage,
} from './LanguageMediaStorageContext';

export function renderWithLanguageMediaStorage(
  ui: ReactElement,
  overrides: Partial<LanguageMediaYearStorage> = {},
) {
  const storageContext: LanguageMediaYearStorage = {
    year: 2026,
    media: [],
    addMedia: jest.fn(),
    addItem: jest.fn(),
    updateItem: jest.fn(),
    deleteItem: jest.fn(),
    ...overrides,
  };
  const contextValue: LanguageMediaStorageContextType = {
    years: [storageContext.year],
    thisYear: storageContext.year,
    selectedYear: storageContext.year,
    isLoading: false,
    selectYear: jest.fn(),
    getMediaYear: () => storageContext,
  };
  const result = render(ui, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <LanguageMediaStorageContext.Provider value={contextValue}>
        {children}
      </LanguageMediaStorageContext.Provider>
    ),
  });
  return { ...result, storageContext };
}
