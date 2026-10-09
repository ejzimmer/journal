import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import '../index.css';
import { FirebaseContext } from '../shared/FirebaseContext';
import { createMockFirebaseContext } from '../shared/mockFirebase';
import { seedData } from './seedData';
import { App } from './App';
import { DataVersionsContext } from '../DataVersions/DataVersionsContext';
import { ReadSource } from '../shared/localFirst/createLocalFirstContext';
import {
  loadReadSource,
  saveReadSource,
} from '../shared/localFirst/readSourceStorage';
import { convertTreeToV2, V2_ROOT } from '../shared/localFirst/v2Shape';

const contextValue = createMockFirebaseContext(seedData);
const dataVersions = {
  readSource: loadReadSource(),
  switchReadSource: (source: ReadSource) => {
    saveReadSource(source);
    window.location.reload();
  },
  fetchDatabase: async () => ({
    ...seedData,
    [V2_ROOT]: convertTreeToV2('', seedData),
  }),
};

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <FirebaseContext.Provider value={contextValue}>
      <DataVersionsContext.Provider value={dataVersions}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </DataVersionsContext.Provider>
    </FirebaseContext.Provider>
  </React.StrictMode>,
);
