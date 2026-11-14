import React from 'react';
import { createRoot } from 'react-dom/client';
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

import './index.css';
import { App } from './App';
import { AMIMONO_DATA_SHAPE } from './localFirst/amimonoDataShape';
import { ConflictBanner } from 'shared/ConflictBanner';
import { FirebaseContext } from 'shared/FirebaseContext';
import { FIREBASE_CONFIG } from 'shared/firebaseConfig';
import { SaveStatusBanner } from 'shared/SaveStatusBanner';
import { setWaitingRegistration } from 'shared/appUpdateStore';
import { createLocalFirstContext } from 'shared/localFirst/createLocalFirstContext';
import * as serviceWorkerRegistration from 'shared/serviceWorker/serviceWorkerRegistration';

const {
  context: contextValue,
  hydrate,
  saveStatus,
  conflictStatus,
} = createLocalFirstContext(
  getDatabase(initializeApp(FIREBASE_CONFIG)),
  'amimono-local-first',
  AMIMONO_DATA_SHAPE,
);

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
