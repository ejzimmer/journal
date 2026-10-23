import { getDateDaysAgo, getToday } from '../../../shared/dates';
import { isTaskDue } from './utils';

describe('isTaskDue', () => {
  describe('when the task has never been done', () => {
    it('is due', () => {
      expect(isTaskDue(undefined, 2)).toBe(true);
    });
  });

  describe('when the task needs doing more than 3 times a week', () => {
    describe('and it was done today', () => {
      it('is not due', () => {
        expect(isTaskDue(getToday(), 4)).toBe(false);
      });
    });

    describe('and it was last done yesterday', () => {
      it('is due', () => {
        expect(isTaskDue(getDateDaysAgo(1), 4)).toBe(true);
      });
    });
  });

  describe('when the task needs doing 3 times a week', () => {
    describe('and it was last done yesterday', () => {
      it('is not due', () => {
        expect(isTaskDue(getDateDaysAgo(1), 3)).toBe(false);
      });
    });

    describe('and it was last done 2 days ago', () => {
      it('is due', () => {
        expect(isTaskDue(getDateDaysAgo(2), 3)).toBe(true);
      });
    });
  });

  describe('when the task needs doing twice a week', () => {
    describe('and it was last done 2 days ago', () => {
      it('is not due', () => {
        expect(isTaskDue(getDateDaysAgo(2), 2)).toBe(false);
      });
    });

    describe('and it was last done 3 days ago', () => {
      it('is due', () => {
        expect(isTaskDue(getDateDaysAgo(3), 2)).toBe(true);
      });
    });
  });

  describe('when the task needs doing once a week', () => {
    describe('and it was last done 6 days ago', () => {
      it('is not due', () => {
        expect(isTaskDue(getDateDaysAgo(6), 1)).toBe(false);
      });
    });
  });
});
