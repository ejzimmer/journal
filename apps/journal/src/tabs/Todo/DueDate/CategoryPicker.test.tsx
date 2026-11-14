import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { CategoriesContext } from '..';
import { CategoryPicker } from './CategoryPicker';

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <CategoriesContext.Provider value={['🛒', '🧹']}>
      {children}
    </CategoriesContext.Provider>
  );
}

describe('CategoryPicker', () => {
  describe('when the user clicks the category button', () => {
    it('opens a category combobox in its place', async () => {
      const user = userEvent.setup();
      render(<CategoryPicker category="🛒" onChange={jest.fn()} />, {
        wrapper: Wrapper,
      });
      const button = screen.getByRole('button', { name: 'Category' });

      await user.click(button);

      expect(button).not.toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: 'Category' })).toHaveFocus();
    });

    describe('and picks a new category', () => {
      it('saves it and returns focus to the button', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();
        render(<CategoryPicker category="🛒" onChange={onChange} />, {
          wrapper: Wrapper,
        });
        await user.click(screen.getByRole('button', { name: 'Category' }));

        await user.click(
          screen.getByRole('option', { name: '🧹', hidden: true }),
        );

        expect(onChange).toHaveBeenCalledWith('🧹');
        expect(screen.getByRole('button', { name: 'Category' })).toHaveFocus();
      });
    });

    describe('and presses Escape', () => {
      it('closes the combobox without saving', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();
        render(<CategoryPicker category="🛒" onChange={onChange} />, {
          wrapper: Wrapper,
        });
        await user.click(screen.getByRole('button', { name: 'Category' }));
        const combobox = screen.getByRole('combobox', { name: 'Category' });

        await user.keyboard('{Escape}');

        expect(combobox).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Category' })).toHaveFocus();
        expect(onChange).not.toHaveBeenCalled();
      });
    });
  });
});
