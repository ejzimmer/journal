import { ReactNode } from 'react';
import { Menu } from '../../shared/controls/Menu';
import { useWorkStorage } from './WorkStorageContext';
import { WorkTask, WORK_KEY } from './types';
import { getAppendPosition } from './taskPosition';
import { getToday } from '../../shared/dates';

type MoveToListActionProps = {
  task: WorkTask;
  currentListId: string;
  destination: WorkTask;
  icon: ReactNode;
};

export function MoveToListAction({
  task,
  currentListId,
  destination,
  icon,
}: MoveToListActionProps) {
  const { moveTask } = useWorkStorage();

  return (
    <Menu.Action
      onClick={() => {
        moveTask({
          task,
          movedItem: {
            ...task,
            position: getAppendPosition(destination),
            lastStatusUpdate: getToday(),
          },
          sourceListId: `${WORK_KEY}/${currentListId}/items`,
          targetListId: `${WORK_KEY}/${destination.id}/items`,
        });
      }}
    >
      {icon}
      {destination.description}
    </Menu.Action>
  );
}
