import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './index.css';
import { App } from './App';
import { SaveStatusBanner } from 'shared/SaveStatusBanner';
import { ConflictBanner } from 'shared/ConflictBanner';
import { setWaitingRegistration } from 'shared/appUpdateStore';
import * as serviceWorkerRegistration from 'shared/serviceWorker/serviceWorkerRegistration';

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { FirebaseContext } from 'shared/FirebaseContext';
import { FIREBASE_CONFIG } from 'shared/firebaseConfig';
import { createLocalFirstContext } from 'shared/localFirst/createLocalFirstContext';
import { JOURNAL_DATA_SHAPE } from './localFirst/v2Shape';

const {
  context: contextValue,
  hydrate,
  saveStatus,
  conflictStatus,
} = createLocalFirstContext(
  getDatabase(initializeApp(FIREBASE_CONFIG)),
  'journal-local-first',
  JOURNAL_DATA_SHAPE,
);

serviceWorkerRegistration.register({ onUpdate: setWaitingRegistration });

hydrate().then(() => {
  const container = document.getElementById('root');
  const root = createRoot(container!);

  root.render(
    <React.StrictMode>
      <FirebaseContext.Provider value={contextValue}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </FirebaseContext.Provider>
      <SaveStatusBanner saveStatus={saveStatus} />
      <ConflictBanner conflictStatus={conflictStatus} />
    </React.StrictMode>,
  );
});
