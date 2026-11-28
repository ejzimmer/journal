import { useEffect, useState } from 'react';

import { searchRavelryYarns } from './searchRavelryYarns';
import { RavelryYarn } from './types';

const MIN_QUERY_LENGTH = 3;
const SEARCH_DELAY_MS = 300;

export function useRavelryYarnSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [yarns, setYarns] = useState<RavelryYarn[]>([]);
  const query = searchTerm.trim();
  const isSearchable = query.length >= MIN_QUERY_LENGTH;

  useEffect(() => {
    if (!isSearchable) return;

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      searchRavelryYarns(query, controller.signal)
        .then(setYarns)
        .catch(() => {
          if (!controller.signal.aborted) setYarns([]);
        });
    }, SEARCH_DELAY_MS);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, isSearchable]);

  return {
    yarns: isSearchable ? yarns : [],
    searchYarns: setSearchTerm,
  };
}
