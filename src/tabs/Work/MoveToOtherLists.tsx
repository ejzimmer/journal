import { Menu } from '../../shared/controls/Menu';
import { ArrowRightIcon } from '../../shared/icons/ArrowRight';
import { ReturnArrowIcon } from '../../shared/icons/ReturnArrow';
import { WorkTask } from './types';
import { MoveToListAction } from './MoveToListAction';
import {
  findPriorityDestinations,
  TODAY_LIST_NAME,
} from './priorityDestination';

type MoveToOtherListsProps = {
  allLists: WorkTask[];
  currentListId: string;
  doneListId?: string;
  task: WorkTask;
};

const iconProps = { width: '16px', colour: 'var(--action-colour-dark)' };

export function MoveToOtherLists({
  allLists,
  currentListId,
  doneListId,
  task,
}: MoveToOtherListsProps) {
  const currentList = allLists.find(({ id }) => id === currentListId);
  const otherLists = allLists.filter(
    ({ id }) => id !== currentListId && id !== doneListId,
  );
  const priorityDestinations = findPriorityDestinations(
    otherLists,
    currentList,
    task,
  );
  const remainingLists = otherLists.filter(
    (list) => !priorityDestinations.includes(list),
  );

  return (
    <>
      {priorityDestinations.length > 0 && (
        <>
          {priorityDestinations.map((destination) => (
            <MoveToListAction
              key={destination.id}
              task={task}
              currentListId={currentListId}
              destination={destination}
              icon={
                destination.description === TODAY_LIST_NAME ? (
                  <ArrowRightIcon {...iconProps} />
                ) : (
                  <ReturnArrowIcon {...iconProps} />
                )
              }
            />
          ))}
          <Menu.Divider />
        </>
      )}
      {remainingLists.map((destination) => (
        <MoveToListAction
          key={destination.id}
          task={task}
          currentListId={currentListId}
          destination={destination}
          icon={<ArrowRightIcon {...iconProps} />}
        />
      ))}
    </>
  );
}
