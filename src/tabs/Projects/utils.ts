import { useStorageContext } from '../../shared/FirebaseContext';
import {
  Category,
  DAILY_KEY,
  DailyTask,
  ProjectDetails,
  PROJECTS_KEY,
} from '../../shared/types';
import { OrderedListItem } from '../../shared/drag-and-drop/types';
import { renumberPositions } from '../../shared/drag-and-drop/utils';
import { getToday } from '../../shared/dates';

export const getSubtasksKey = (projectId: string, subtaskId?: string) => {
  const key = PROJECTS_KEY + `/${projectId}/subtasks`;

  return subtaskId ? `${key}/${subtaskId}` : key;
};

export function useLinkedTasks(linkedId?: string) {
  const { useValue, addItem, updateItem } = useStorageContext();

  const { value: linkedTask } = useValue<DailyTask>(
    linkedId && `${DAILY_KEY}/${linkedId}`,
  );

  const createLinkedTask = ({
    description,
    category,
    linkedTaskId,
  }: {
    description: string;
    category: Category;
    linkedTaskId: string;
  }) => {
    const linkedId = addItem<Omit<DailyTask, keyof OrderedListItem>>(
      DAILY_KEY,
      {
        category,
        description,
        status: 'ready',
        type: '一度',
        lastCompleted: getToday(),
        linkedTask: linkedTaskId,
      },
    );

    return linkedId;
  };

  const updateLinkedTask = (updatedTask: Partial<DailyTask>) => {
    if (!linkedTask) return;

    updateItem<DailyTask>(DAILY_KEY, {
      ...linkedTask,
      ...updatedTask,
    });
  };

  return { linkedTask, createLinkedTask, updateLinkedTask };
}

export function reorderProjects(
  projects: ProjectDetails[],
  indexToRemove: number,
) {
  return renumberPositions(projects.toSpliced(indexToRemove, 1));
}

const getStatus = (project: ProjectDetails) => project.status ?? 'ready';

function getDestination(
  projects: ProjectDetails[],
  indexToMove: number,
  findDestination: (remainingProjects: ProjectDetails[]) => number,
) {
  const remainingProjects = projects.toSpliced(indexToMove, 1);
  const destination = findDestination(remainingProjects);

  return destination === -1 ? remainingProjects.length : destination;
}

const getStartDestination = (projects: ProjectDetails[], indexToMove: number) =>
  Math.min(
    getDestination(projects, indexToMove, (remainingProjects) =>
      remainingProjects.findIndex(
        (project) => getStatus(project) !== 'in_progress',
      ),
    ),
    indexToMove,
  );

const getEndDestination = (projects: ProjectDetails[], indexToMove: number) =>
  Math.max(
    getDestination(projects, indexToMove, (remainingProjects) =>
      remainingProjects.findIndex((project) => getStatus(project) === 'done'),
    ),
    indexToMove,
  );

function moveProject(
  projects: ProjectDetails[],
  indexToMove: number,
  destination: number,
) {
  return renumberPositions(
    projects
      .toSpliced(indexToMove, 1)
      .toSpliced(destination, 0, projects[indexToMove]),
  );
}

export const moveProjectToStart = (
  projects: ProjectDetails[],
  indexToMove: number,
) =>
  moveProject(
    projects,
    indexToMove,
    getStartDestination(projects, indexToMove),
  );

export const moveProjectToEnd = (
  projects: ProjectDetails[],
  indexToMove: number,
) =>
  moveProject(projects, indexToMove, getEndDestination(projects, indexToMove));

export const isProjectAtStart = (
  projects: ProjectDetails[],
  indexToMove: number,
) => getStartDestination(projects, indexToMove) === indexToMove;

export const isProjectAtEnd = (
  projects: ProjectDetails[],
  indexToMove: number,
) => getEndDestination(projects, indexToMove) === indexToMove;
