import {
  createDailyJobsStorage,
  renderDailyJob,
} from '../../shared/dailyJobs/dailyJobsTestUtils';
import { LABELS_KEY, StoredLabel } from './types';
import { useStaleLabelCleanup } from './useStaleLabelCleanup';

const dayMs = 24 * 60 * 60 * 1000;

const createLabel = (id: string, lastRemoved?: number): StoredLabel => ({
  id,
  value: id,
  colour: 'purple',
  ...(lastRemoved !== undefined && { lastRemoved }),
});

const cleanUpLabels = (labels: StoredLabel[]) => {
  const storage = createDailyJobsStorage({
    [LABELS_KEY]: Object.fromEntries(labels.map((label) => [label.id, label])),
  });
  renderDailyJob(useStaleLabelCleanup, storage);

  return storage;
};

describe('cleaning up stale work labels', () => {
  describe('a label removed more than a week ago', () => {
    it('is deleted', () => {
      const stale = createLabel('stale', Date.now() - 8 * dayMs);
      const storage = cleanUpLabels([stale]);

      expect(storage.deleteItem).toHaveBeenCalledWith(LABELS_KEY, stale);
    });
  });

  describe('a label removed within the last week', () => {
    it('is left alone', () => {
      const storage = cleanUpLabels([
        createLabel('recent', Date.now() - dayMs),
      ]);

      expect(storage.deleteItem).not.toHaveBeenCalled();
    });
  });

  describe('a label still in use', () => {
    it('is left alone', () => {
      const storage = cleanUpLabels([createLabel('in-use')]);

      expect(storage.deleteItem).not.toHaveBeenCalled();
    });
  });

  describe('a mix of stale and current labels', () => {
    it('deletes only the stale ones', () => {
      const stale = createLabel('stale', Date.now() - 8 * dayMs);
      const alsoStale = createLabel('also-stale', Date.now() - 30 * dayMs);
      const storage = cleanUpLabels([
        createLabel('in-use'),
        stale,
        createLabel('recent', Date.now() - dayMs),
        alsoStale,
      ]);

      expect(storage.deleteItem).toHaveBeenCalledWith(LABELS_KEY, stale);
      expect(storage.deleteItem).toHaveBeenCalledWith(LABELS_KEY, alsoStale);
      expect(storage.deleteItem).toHaveBeenCalledTimes(2);
    });
  });

  describe('when the job has already run today', () => {
    it("doesn't sweep again", () => {
      const stale = createLabel('stale', Date.now() - 8 * dayMs);
      const storage = createDailyJobsStorage({
        [LABELS_KEY]: { [stale.id]: stale },
        'work-labels-cleanup': Date.now(),
      });
      renderDailyJob(useStaleLabelCleanup, storage);

      expect(storage.deleteItem).not.toHaveBeenCalled();
    });
  });
});
