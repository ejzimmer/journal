import React from 'react';
import { createRoot } from 'react-dom/client';

import '../index.css';
import { HomePage } from '../HomePage';
import { FirebaseContext } from 'shared/FirebaseContext';
import { createMockFirebaseContext } from 'shared/mockFirebase';
import { seedData } from './seedData';

const root = createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <FirebaseContext.Provider value={createMockFirebaseContext(seedData)}>
      <HomePage />
    </FirebaseContext.Provider>
  </React.StrictMode>,
);
