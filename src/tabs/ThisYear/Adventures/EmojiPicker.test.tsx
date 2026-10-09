import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmojiPicker } from './EmojiPicker';

jest.mock('emoji-picker-react', () => ({
  __esModule: true,
  EmojiStyle: { NATIVE: 'native' },
  default: ({ height }: { height: number }) => (
    <div role="grid" aria-label="Emojis" style={{ height }} />
  ),
}));

const openPickerWithTriggerAt = async (top: number, viewportHeight = 800) => {
  window.innerHeight = viewportHeight;
  render(<EmojiPicker value="🏃" onChange={jest.fn()} />);
  const trigger = screen.getByRole('button', { name: 'Emoji' });
  jest
    .spyOn(trigger, 'getBoundingClientRect')
    .mockReturnValue({ top, bottom: top + 40 } as DOMRect);

  await userEvent.click(trigger);

  return screen.getByRole('grid', { name: 'Emojis' });
};

describe('EmojiPicker', () => {
  describe('when opened', () => {
    describe('with plenty of room below the trigger', () => {
      it('opens below at full height', async () => {
        const picker = await openPickerWithTriggerAt(100);

        expect(picker).toHaveStyle({ height: '360px' });
        expect(picker.parentElement).not.toHaveClass('above');
      });
    });

    describe('with a little room below the trigger', () => {
      it('shrinks to fit the space below', async () => {
        const picker = await openPickerWithTriggerAt(450);

        expect(picker).toHaveStyle({ height: '288px' });
        expect(picker.parentElement).not.toHaveClass('above');
      });
    });

    describe('with too little room below and more above', () => {
      it('opens above, fitted to the space there', async () => {
        const picker = await openPickerWithTriggerAt(300, 450);

        expect(picker).toHaveStyle({ height: '278px' });
        expect(picker.parentElement).toHaveClass('above');
      });
    });
  });
});
