import { WorkTask } from './types';
import { getFeatureGateName } from './featureGate';

export const TODAY_LIST_NAME = 'Today';
const FEATURE_GATES_LIST_NAME = 'Feature gates';

export function findPriorityDestinations(
  destinations: WorkTask[],
  currentList: WorkTask | undefined,
  task: WorkTask,
): WorkTask[] {
  if (currentList?.description !== TODAY_LIST_NAME) {
    return destinations.filter(
      ({ description }) => description === TODAY_LIST_NAME,
    );
  }

  const labelDestination = destinations.find(({ labelIds }) => {
    const listLabelId = labelIds?.[0];
    return listLabelId && task.labelIds?.includes(listLabelId);
  });
  const featureGateDestination = getFeatureGateName(task.description)
    ? destinations.find(
        ({ description }) => description === FEATURE_GATES_LIST_NAME,
      )
    : undefined;

  return [...new Set([labelDestination, featureGateDestination])].filter(
    (destination): destination is WorkTask => !!destination,
  );
}
