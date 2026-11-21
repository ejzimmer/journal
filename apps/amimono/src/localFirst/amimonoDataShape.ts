import { createSubtreeDataShape } from 'shared/localFirst/dataShape';
import { TODAY_SLOTS_KEY } from 'shared/todaySlots/types';

export const AMIMONO_SUBTREE = 'amimono';

export const AMIMONO_DATA_SHAPE = createSubtreeDataShape(AMIMONO_SUBTREE, [
  TODAY_SLOTS_KEY,
]);
