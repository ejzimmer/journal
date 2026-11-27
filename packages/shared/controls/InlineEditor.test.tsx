import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InlineEditor } from './InlineEditor';

function renderEditor() {
  const onSave = jest.fn();
  const onClose = jest.fn();
  render(
    <InlineEditor className="editor" onSave={onSave} onClose={onClose}>
      <input aria-label="Description" />
    </InlineEditor>,
  );

  return { onSave, onClose };
}

describe('InlineEditor', () => {
  describe('when the user presses Enter in an input', () => {
    it('saves and then closes', async () => {
      const user = userEvent.setup();
      const { onSave, onClose } = renderEditor();

      await user.type(screen.getByRole('textbox'), 'thing{Enter}');

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onSave.mock.invocationCallOrder[0]).toBeLessThan(
        onClose.mock.invocationCallOrder[0],
      );
    });
  });

  describe('when the user presses Escape in an input', () => {
    it('closes without saving', async () => {
      const user = userEvent.setup();
      const { onSave, onClose } = renderEditor();

      await user.type(screen.getByRole('textbox'), 'thing{Escape}');

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onSave).not.toHaveBeenCalled();
    });
  });
});
