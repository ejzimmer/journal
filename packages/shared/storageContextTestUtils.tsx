import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ContextType, FirebaseContext } from './FirebaseContext';

export function createStorageContext(
  overrides: Partial<ContextType> = {},
): ContextType {
  return {
    addItem: jest.fn(),
    updateItem: jest.fn(),
    deleteItem: jest.fn(),
    updateList: jest.fn(),
    setValue: jest.fn(),
    setValues: jest.fn(),
    claimDailyRun: jest.fn().mockResolvedValue(true),
    useValue: () => ({ value: undefined, loading: false, synced: true }),
    moveItemBetweenLists: jest.fn(),
    ...overrides,
  };
}

type StorageContextWrapperProps = {
  value?: Partial<ContextType>;
  children: ReactNode;
};

export function StorageContextWrapper({
  value,
  children,
}: StorageContextWrapperProps) {
  return (
    <FirebaseContext.Provider value={createStorageContext(value)}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function renderWithStorage(
  ui: ReactElement,
  {
    value,
    ...options
  }: { value?: Partial<ContextType> } & Omit<RenderOptions, 'wrapper'> = {},
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <StorageContextWrapper value={value}>{children}</StorageContextWrapper>
    ),
    ...options,
  });
}
