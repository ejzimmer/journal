import { createRef } from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithStorage } from '../../../shared/storageContextTestUtils';
import { SockProgress } from '../../../shared/types';
import { SockTracker } from './SockTracker';

const projectId = 'project-1';
const socksKey = `projects/${projectId}/socks`;

const createSocks = (
  first: number,
  second: number,
  direction: SockProgress['direction'] = 'cuff_down',
): SockProgress => ({
  direction,
  knittedSections: { first, second },
});

function renderSockTracker(socks: SockProgress) {
  const setValue = jest.fn();
  renderWithStorage(
    <SockTracker
      projectId={projectId}
      socks={socks}
      trackerRef={createRef()}
    />,
    { value: { setValue } },
  );

  return { setValue };
}

const getSock = (name: 'first' | 'second') =>
  screen.getByRole('slider', { name: `${name} sock` });

describe('SockTracker', () => {
  describe('clicking a section', () => {
    describe('when it has not been knitted', () => {
      it('knits the sock up to and including that section', async () => {
        const user = userEvent.setup();
        const { setValue } = renderSockTracker(createSocks(6, 1));

        await user.click(
          within(getSock('second')).getByText('Knit through heel'),
        );

        expect(setValue).toHaveBeenCalledWith(socksKey, createSocks(6, 3));
      });
    });

    describe('when it has been knitted', () => {
      it('unravels the sock back to the start of that section', async () => {
        const user = userEvent.setup();
        const { setValue } = renderSockTracker(createSocks(5, 2));

        await user.click(
          within(getSock('first')).getByText('Unravel from leg'),
        );

        expect(setValue).toHaveBeenCalledWith(socksKey, createSocks(1, 2));
      });
    });

    describe('when the socks are knit toe up', () => {
      it('starts from the toe', async () => {
        const user = userEvent.setup();
        const { setValue } = renderSockTracker(createSocks(0, 0, 'toe_up'));

        await user.click(
          within(getSock('first')).getByText('Knit through toe'),
        );

        expect(setValue).toHaveBeenCalledWith(
          socksKey,
          createSocks(1, 0, 'toe_up'),
        );
      });
    });
  });

  describe('using the keyboard on a sock', () => {
    describe('pressing up', () => {
      it('knits the next section', async () => {
        const user = userEvent.setup();
        const { setValue } = renderSockTracker(createSocks(2, 0));

        getSock('first').focus();
        await user.keyboard('{ArrowUp}');

        expect(setValue).toHaveBeenCalledWith(socksKey, createSocks(3, 0));
      });

      describe('when the sock is fully knitted', () => {
        it('keeps it at the last section', async () => {
          const user = userEvent.setup();
          const { setValue } = renderSockTracker(createSocks(6, 0));

          getSock('first').focus();
          await user.keyboard('{ArrowUp}');

          expect(setValue).toHaveBeenCalledWith(socksKey, createSocks(6, 0));
        });
      });
    });

    describe('pressing down', () => {
      it('unravels the last knitted section', async () => {
        const user = userEvent.setup();
        const { setValue } = renderSockTracker(createSocks(6, 4));

        getSock('second').focus();
        await user.keyboard('{ArrowDown}');

        expect(setValue).toHaveBeenCalledWith(socksKey, createSocks(6, 3));
      });
    });
  });

  describe('changing direction', () => {
    it('keeps how many sections each sock has knitted', async () => {
      const user = userEvent.setup();
      const { setValue } = renderSockTracker(createSocks(6, 2));

      await user.click(screen.getByRole('radio', { name: 'Toe up' }));

      expect(setValue).toHaveBeenCalledWith(
        socksKey,
        createSocks(6, 2, 'toe_up'),
      );
    });
  });
});
