import { screen } from '@testing-library/react';
import { renderWithLanguageMediaStorage } from './languageMediaStorageTestUtils';
import { MediaVine } from './MediaVine';
import { lupin } from './testMedia';

describe('MediaVine', () => {
  it('names the vine after the series', () => {
    renderWithLanguageMediaStorage(<MediaVine series={lupin} />);

    expect(screen.getByRole('img', { name: 'Lupin' })).toBeInTheDocument();
  });

  it('puts up a signpost with the series name', () => {
    renderWithLanguageMediaStorage(<MediaVine series={lupin} />);

    expect(screen.getByText('Lupin')).toHaveClass('sign-board');
  });
});
