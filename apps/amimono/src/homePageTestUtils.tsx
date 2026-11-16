import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { HomePage } from './HomePage';
import { FirebaseContext } from 'shared/FirebaseContext';
import { createMockFirebaseContext } from 'shared/mockFirebase';

export function renderHomePage(seed: Record<string, unknown>) {
  const user = userEvent.setup();
  render(
    <FirebaseContext.Provider value={createMockFirebaseContext(seed)}>
      <HomePage />
    </FirebaseContext.Provider>,
  );
  return { user };
}

export function findCard(projectName: string) {
  const card = screen
    .getAllByRole('listitem')
    .find(
      (listItem) =>
        listItem.querySelector('.project-name')?.textContent === projectName,
    );
  if (!card) throw new Error(`No card for ${projectName}`);
  return card;
}
