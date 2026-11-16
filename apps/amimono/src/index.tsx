import React from 'react';
import { createRoot } from 'react-dom/client';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

import './index.css';
import { App } from './App';
import { AMIMONO_DATA_SHAPE } from './localFirst/amimonoDataShape';
import { migrateFromJournal } from './migration/migrateFromJournal';
import { ConflictBanner } from 'shared/ConflictBanner';
import { FirebaseContext } from 'shared/FirebaseContext';
import { FIREBASE_CONFIG } from 'shared/firebaseConfig';
import { SaveStatusBanner } from 'shared/SaveStatusBanner';
import { setWaitingRegistration } from 'shared/appUpdateStore';
import { createLocalFirstContext } from 'shared/localFirst/createLocalFirstContext';
import * as serviceWorkerRegistration from 'shared/serviceWorker/serviceWorkerRegistration';

const firebaseApp = initializeApp(FIREBASE_CONFIG);
const database = getDatabase(firebaseApp);
const {
  context: contextValue,
  hydrate,
  saveStatus,
  conflictStatus,
} = createLocalFirstContext(
  database,
  'amimono-local-first',
  AMIMONO_DATA_SHAPE,
);

onAuthStateChanged(getAuth(firebaseApp), (user) => {
  if (user) void migrateFromJournal(database);
});

serviceWorkerRegistration.register({ onUpdate: setWaitingRegistration });

hydrate().then(() => {
  const root = createRoot(document.getElementById('root')!);

  root.render(
    <React.StrictMode>
      <FirebaseContext.Provider value={contextValue}>
        <App />
      </FirebaseContext.Provider>
      <SaveStatusBanner saveStatus={saveStatus} />
      <ConflictBanner conflictStatus={conflictStatus} />
    </React.StrictMode>,
  );
});
