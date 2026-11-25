import { render, screen, within } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { FirebaseContext } from 'shared/FirebaseContext';
import { createMockFirebaseContext } from 'shared/mockFirebase';

import { JumpersTab } from './JumpersTab';

function renderJumpersTab() {
  const user = userEvent.setup();
  render(
    <FirebaseContext.Provider value={createMockFirebaseContext({})}>
      <JumpersTab />
    </FirebaseContext.Provider>,
  );
  return { user };
}

async function typeNumber(
  user: UserEvent,
  container: HTMLElement,
  label: string,
  value: string,
) {
  await user.type(
    within(container).getByRole('spinbutton', { name: label }),
    value,
  );
}

async function enterEasedMeasurement(
  user: UserEvent,
  label: string,
  cm: string,
  easeCm: string,
) {
  const fieldset = screen.getByRole('group', { name: label });
  await typeNumber(user, fieldset, label, cm);
  await typeNumber(user, fieldset, 'Ease', easeCm);
}

async function enterGauge(
  user: UserEvent,
  legend: string,
  [stitches, rows, needleMm]: string[],
) {
  const fieldset = screen.getByRole('group', { name: legend });
  await typeNumber(user, fieldset, 'Stitches', stitches);
  await typeNumber(user, fieldset, 'Rows', rows);
  await typeNumber(user, fieldset, 'Needle', needleMm);
}

async function enterExampleMeasurements(user: UserEvent) {
  const form = screen.getByRole('region', { name: 'New pattern' });
  await typeNumber(user, form, 'Neck width', '21');
  await typeNumber(user, form, 'Cross chest', '43');
  await typeNumber(user, form, 'Armhole depth', '23');
  await typeNumber(user, form, 'Hem to armhole', '41');
  await typeNumber(user, form, 'Waist to hip', '28');
  await typeNumber(user, form, 'Wrist to underarm', '50');
  await enterEasedMeasurement(user, 'Bust', '101.5', '5');
  await enterEasedMeasurement(user, 'Waist', '86', '12.5');
  await enterEasedMeasurement(user, 'Hips', '105', '10');
  await enterEasedMeasurement(user, 'Biceps', '29', '5');
  await enterEasedMeasurement(user, 'Wrist', '16', '7.5');
  await enterGauge(user, 'Body gauge per 10cm', ['22', '29', '4.5']);
  await user.type(
    within(
      screen.getByRole('group', { name: 'Body gauge per 10cm' }),
    ).getByRole('textbox', { name: 'Yarn' }),
    'grey',
  );
  await enterGauge(user, 'Sleeve gauge per 10cm', ['24', '31', '4']);
  await typeNumber(user, form, 'Sleeve cap top', '30');
}

describe('JumpersTab', () => {
  describe('when every measurement is filled in', () => {
    it('shows the generated pattern', async () => {
      const { user } = renderJumpersTab();

      await enterExampleMeasurements(user);

      const back = screen.getByRole('region', { name: 'Back' });
      expect(within(back).getAllByRole('listitem')[0]).toHaveTextContent(
        'With smaller needles and the grey yarn, cast on 128 sts.',
      );
      const sleeves = screen.getByRole('region', { name: 'Sleeves (make 2)' });
      expect(within(sleeves).getAllByRole('listitem')[0]).toHaveTextContent(
        'With smaller needles, cast on 56 sts.',
      );
    });

    describe('and the pattern is saved with a name', () => {
      it('lists it under that name', async () => {
        const { user } = renderJumpersTab();
        await enterExampleMeasurements(user);

        await user.type(
          screen.getByRole('textbox', { name: 'Pattern name' }),
          'Hooded cardigan',
        );
        await user.click(screen.getByRole('button', { name: 'Save pattern' }));

        const saved = screen.getByRole('region', { name: 'Saved patterns' });
        await user.click(within(saved).getByText('Hooded cardigan'));
        expect(
          within(
            within(saved).getByRole('region', { name: 'Back' }),
          ).getAllByRole('listitem')[0],
        ).toHaveTextContent('cast on 128 sts');
      });
    });
  });

  describe('when a measurement comes from a garment', () => {
    it('stops asking for its ease', async () => {
      const { user } = renderJumpersTab();
      const hips = screen.getByRole('group', { name: 'Hips' });
      const ease = within(hips).getByRole('spinbutton', { name: 'Ease' });

      await user.click(within(hips).getByRole('radio', { name: 'Garment' }));

      expect(ease).not.toBeInTheDocument();
    });
  });
});
