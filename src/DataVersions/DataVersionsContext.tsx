import { createContext, useContext } from 'react';
import { ReadSource } from '../shared/localFirst/createLocalFirstContext';

export type DataVersionsContextType = {
  readSource: ReadSource;
  switchReadSource: (source: ReadSource) => void;
  fetchDatabase: () => Promise<Record<string, unknown>>;
};

export const DataVersionsContext = createContext<
  DataVersionsContextType | undefined
>(undefined);

export function useDataVersions(): DataVersionsContextType {
  const context = useContext(DataVersionsContext);
  if (!context) {
    throw new Error('Data versions context not found');
  }

  return context;
}
