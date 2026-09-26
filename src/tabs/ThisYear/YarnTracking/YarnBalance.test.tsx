import { screen } from '@testing-library/react';
import { YarnBalance } from './YarnBalance';
import { renderWithYarnStorage } from './yarnStorageTestUtils';

describe('YarnBalance', () => {
  describe('with yarn in the stash', () => {
    it('shows the grams currently in the stash', () => {
      renderWithYarnStorage(<YarnBalance />, { currentBalance: 1000 });

      expect(screen.getByText('1,000g')).toBeInTheDocument();
    });
  });
});
