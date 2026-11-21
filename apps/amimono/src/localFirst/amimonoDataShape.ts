import { createSubtreeDataShape } from 'shared/localFirst/dataShape';
import { TODAY_SLOTS_KEY } from 'shared/todaySlots/types';

export const AMIMONO_DATA_SHAPE = createSubtreeDataShape('amimono', [
  TODAY_SLOTS_KEY,
]);
