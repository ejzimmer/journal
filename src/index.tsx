import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './index.css';
import { App } from './App';
import { AppUpdateBanner } from './shared/AppUpdateBanner';
import { setWaitingRegistration } from './shared/appUpdateStore';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

import { initializeApp } from 'firebase/app';
import { get, getDatabase, ref } from 'firebase/database';
import { FirebaseContext } from './shared/FirebaseContext';
import {
  createLocalFirstContext,
  ReadSource,
} from './shared/localFirst/createLocalFirstContext';
import {
  loadReadSource,
  saveReadSource,
} from './shared/localFirst/readSourceStorage';
import { DataVersionsContext } from './DataVersions/DataVersionsContext';

const firebaseConfig = {
  apiKey: 'AIzaSyAlKw5_aMOUlR3SdkbU6vHADLTUvXZHNJg',
  authDomain: 'journal-50dcf.firebaseapp.com',
  projectId: 'journal-50dcf',
  storageBucket: 'journal-50dcf.appspot.com',
  messagingSenderId: '212303689127',
  appId: '1:212303689127:web:4cb9352399529de15ff282',
  databaseURL:
    'https://journal-50dcf-default-rtdb.asia-southeast1.firebasedatabase.app',
};

const database = getDatabase(initializeApp(firebaseConfig));
const readSource = loadReadSource();
const { context: contextValue, hydrate } = createLocalFirstContext(
  database,
  undefined,
  readSource,
);
const dataVersions = {
  readSource,
  switchReadSource: (source: ReadSource) => {
    saveReadSource(source);
    window.location.reload();
  },
  fetchDatabase: async () => (await get(ref(database))).val() ?? {},
};

serviceWorkerRegistration.register({ onUpdate: setWaitingRegistration });

hydrate().then(() => {
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
      <AppUpdateBanner />
    </React.StrictMode>,
  );
});
