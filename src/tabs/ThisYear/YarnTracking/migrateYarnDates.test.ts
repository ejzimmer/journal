import { migrateYarnDates } from './migrateYarnDates';

describe('migrateYarnDates', () => {
  describe('when the months are stored as two-digit years', () => {
    it('rewrites each month as a four-digit year and month', () => {
      expect(
        migrateYarnDates({
          'sock yarn': {
            id: 'sock yarn',
            history: { '25-12': 2400, '26-01': 2471 },
          },
        }),
      ).toEqual({
        'sock yarn': {
          id: 'sock yarn',
          history: { '2025-12': 2400, '2026-01': 2471 },
        },
      });
    });
  });

  describe('when the months are already stored as four-digit years', () => {
    it('leaves them as they are', () => {
      const yarn = { wool: { id: 'wool', history: { '2026-09': 3091 } } };

      expect(migrateYarnDates(yarn)).toEqual(yarn);
    });
  });
});
