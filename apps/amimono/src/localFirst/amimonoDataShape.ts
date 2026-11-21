import { createSubtreeDataShape } from 'shared/localFirst/dataShape';
import { DAILY_GOALS_KEY } from 'shared/dailyGoals/types';

export const AMIMONO_SUBTREE = 'amimono';

export const AMIMONO_DATA_SHAPE = createSubtreeDataShape(AMIMONO_SUBTREE, [
  DAILY_GOALS_KEY,
]);

export const createJournalPath = (amimonoPath: string) =>
  `${AMIMONO_SUBTREE}/${amimonoPath}`;
