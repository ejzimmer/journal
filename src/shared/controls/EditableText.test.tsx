import { render, screen } from '@testing-library/react';
import { EditableText } from './EditableText';
import userEvent from '@testing-library/user-event';

const TEXT = 'Buy fabric';

const defaultProps = {
  onChange: jest.fn(),
  value: TEXT,
  label: 'test',
};

describe('EditableLabel', () => {
  it('renders plain text', () => {
    render(<EditableText {...defaultProps} />);

    expect(getText(TEXT)).toBeInTheDocument();
    expect(queryInput()).not.toBeInTheDocument();
  });

  describe('when the element is clicked', () => {
    it('renders an input', async () => {
      const user = userEvent.setup();
      render(<EditableText {...defaultProps} />);

      await user.click(getText(TEXT));

      const input = getInput();
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue(TEXT);
      expect(getText(TEXT)).not.toBeVisible();
    });
  });

  describe('when the user presses enter on the element', () => {
    it('renders an input', async () => {
      const user = userEvent.setup();
      render(<EditableText {...defaultProps} />);

      await user.tab();
      await user.keyboard('{Enter}');

      expect(getInput()).toHaveValue(TEXT);
    });
  });

  describe('when the user presses escape', () => {
    it('renders plain text without calling onChange', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<EditableText {...defaultProps} onChange={onChange} />);

      await user.click(getText(TEXT));
      const input = getInput();
      await user.clear(input);
      await user.type(input, 'Buy pattern{Escape}');

      expect(input).not.toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('when editing finishes', () => {
    it('returns focus to the text', async () => {
      const user = userEvent.setup();
      render(<EditableText {...defaultProps} />);

      await user.click(getText(TEXT));
      await user.keyboard('{Enter}');

      expect(getText(TEXT)).toHaveFocus();
    });
  });

  describe('when the user presses enter', () => {
    describe('when the description has not changed', () => {
      it('renders plain text and does not call onUpdate', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();
        render(<EditableText {...defaultProps} onChange={onChange} />);

        await user.click(getText(TEXT));
        const input = getInput();
        await user.type(input, '{Enter}');

        expect(getText(TEXT)).toBeInTheDocument();
        expect(input).not.toBeInTheDocument();
        expect(onChange).not.toHaveBeenCalled();
      });
    });

    describe('when the description has changed', () => {
      it('renders plain text and calls onUpdate', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();
        render(<EditableText {...defaultProps} onChange={onChange} />);

        await user.click(getText(TEXT));
        const input = getInput();
        await user.clear(input);
        await user.type(input, 'Buy pattern');
        await user.keyboard('{Enter}');

        expect(getText(TEXT)).toBeInTheDocument();
        expect(input).not.toBeInTheDocument();
        expect(onChange).toHaveBeenCalledWith('Buy pattern');
      });
    });

    describe('when the description is empty', () => {
      it('calls onDelete', async () => {
        const user = userEvent.setup();

        const onChange = jest.fn();
        const onDelete = jest.fn();
        render(
          <EditableText
            {...defaultProps}
            onChange={onChange}
            onDelete={onDelete}
          />,
        );

        await user.click(getText(TEXT));
        const input = getInput();
        await user.clear(input);
        await user.keyboard('{Enter}');

        expect(onChange).not.toHaveBeenCalled();
        expect(onDelete).toHaveBeenCalled();
      });
    });
  });
});

const getText = (content: string) => screen.getByText(content);
const getInput = () => screen.getByRole('textbox');
const queryInput = () => screen.queryByRole('textbox');
