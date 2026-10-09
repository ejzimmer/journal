import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataVersions } from '.';
import { DataVersionsContext } from './DataVersionsContext';
import { ReadSource } from '../shared/localFirst/createLocalFirstContext';

const v1Projects = { garden: { id: 'garden', description: 'Garden' } };

function renderDataVersions({
  readSource = 'v1',
  database = { projects: v1Projects, v2: { projects: v1Projects } },
  fetchDatabase = async () => database,
}: {
  readSource?: ReadSource;
  database?: Record<string, unknown>;
  fetchDatabase?: () => Promise<Record<string, unknown>>;
} = {}) {
  const switchReadSource = jest.fn();
  render(
    <DataVersionsContext.Provider
      value={{ readSource, switchReadSource, fetchDatabase }}
    >
      <DataVersions />
    </DataVersionsContext.Provider>,
  );
  return { switchReadSource, user: userEvent.setup() };
}

describe('DataVersions', () => {
  describe('when reading from v1', () => {
    describe('before comparing', () => {
      it('requires a comparison before switching to v2', () => {
        renderDataVersions();

        expect(
          screen.getByRole('button', { name: 'Read from v2' }),
        ).toBeDisabled();
      });
    });

    describe('when v1 and v2 match', () => {
      it('says so', async () => {
        const { user } = renderDataVersions();

        await user.click(
          screen.getByRole('button', { name: 'Compare v1 and v2' }),
        );

        expect(await screen.findByRole('status')).toHaveTextContent(
          'v1 and v2 match.',
        );
      });

      it('switches to reading from v2', async () => {
        const { user, switchReadSource } = renderDataVersions();
        await user.click(
          screen.getByRole('button', { name: 'Compare v1 and v2' }),
        );

        await user.click(screen.getByRole('button', { name: 'Read from v2' }));

        expect(switchReadSource).toHaveBeenCalledWith('v2');
      });
    });

    describe('when v1 and v2 differ', () => {
      const database = {
        projects: v1Projects,
        v2: { projects: { garden: { id: 'garden', description: 'Old' } } },
      };

      it('lists each difference', async () => {
        const { user } = renderDataVersions({ database });

        await user.click(
          screen.getByRole('button', { name: 'Compare v1 and v2' }),
        );

        expect(await screen.findByRole('status')).toHaveTextContent(
          '1 difference between v1 and v2.',
        );
        expect(
          screen.getByRole('list', { name: 'Differences' }),
        ).toHaveTextContent('projects/garden/description');
      });

      it('still requires a match before switching to v2', async () => {
        const { user } = renderDataVersions({ database });

        await user.click(
          screen.getByRole('button', { name: 'Compare v1 and v2' }),
        );

        await screen.findByRole('list', { name: 'Differences' });
        expect(
          screen.getByRole('button', { name: 'Read from v2' }),
        ).toBeDisabled();
      });
    });

    describe('when the database fails to load', () => {
      it('says so', async () => {
        const { user } = renderDataVersions({
          fetchDatabase: () => Promise.reject(new Error('offline')),
        });

        await user.click(
          screen.getByRole('button', { name: 'Compare v1 and v2' }),
        );

        expect(
          await screen.findByText("Couldn't load the database."),
        ).toBeInTheDocument();
      });
    });
  });

  describe('when reading from v2', () => {
    it('switches back to v1 without comparing', async () => {
      const { user, switchReadSource } = renderDataVersions({
        readSource: 'v2',
      });

      await user.click(screen.getByRole('button', { name: 'Read from v1' }));

      expect(switchReadSource).toHaveBeenCalledWith('v1');
    });
  });
});
