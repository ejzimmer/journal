import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export async function openDisclosureForm(summary: string) {
  const user = userEvent.setup();
  await user.click(screen.getByText(summary));
  return {
    user,
    save: () => user.click(screen.getByRole('button', { name: 'Save' })),
  };
}
