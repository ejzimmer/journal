import { WorkTask } from './types';

export const TODAY_LIST_NAME = 'Today';

export function findPriorityDestination(
  destinations: WorkTask[],
  currentList: WorkTask | undefined,
  task: WorkTask,
): WorkTask | undefined {
  if (currentList?.description !== TODAY_LIST_NAME) {
    return destinations.find(
      ({ description }) => description === TODAY_LIST_NAME,
    );
  }

  return destinations.find(({ labelIds }) => {
    const listLabelId = labelIds?.[0];
    return listLabelId && task.labelIds?.includes(listLabelId);
  });
}
