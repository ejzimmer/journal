import { render, screen } from '@testing-library/react';
import { Signpost } from './Signpost';

describe('Signpost', () => {
  it('shows the name', () => {
    render(<Signpost name="Les Misérables" />);

    expect(screen.getByText('Les Misérables')).toBeInTheDocument();
  });
});
