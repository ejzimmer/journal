import { sortByPosition } from 'shared/drag-and-drop/utils';
import { ListKey, Project, Subtask } from '../projects/types';
import { findProjectType } from './findProjectType';
import { JournalProject, JournalSubtask } from './journalTypes';
import { parseRavelryName } from '../projects/parseRavelryName';

const KNITTING_CATEGORY = '🧶';

export function convertJournalProjects(
  journalProjects: Record<string, JournalProject>,
) {
  const knittingProjects = sortByPosition(
    Object.values(journalProjects).filter(
      (project) => project.category === KNITTING_CATEGORY || project.socks,
    ),
  );
  const listPositions: Record<ListKey, number> = {
    priority: 0,
    portable: 0,
    future: 0,
  };
  const updates: Record<string, unknown> = {};

  knittingProjects.forEach((journalProject) => {
    const project = convertProject(journalProject);
    const listKey =
      journalProject.status === 'in_progress' ? 'portable' : 'future';
    listPositions[listKey] += 1;
    updates[`projects/${project.id}`] = project;
    updates[`lists/${listKey}/${project.id}`] = {
      id: project.id,
      position: listPositions[listKey],
    };
  });

  return updates;
}

function convertProject(journalProject: JournalProject): Project {
  const pattern = parseRavelryName(journalProject.description);
  const name = pattern?.name ?? journalProject.description;
  const subtasks = Object.values(journalProject.subtasks ?? {});

  return {
    id: journalProject.id,
    name,
    type: findProjectType(name, Boolean(journalProject.socks)),
    ...(pattern && { pattern }),
    ...(subtasks.length && {
      subtasks: Object.fromEntries(
        subtasks.map((subtask) => [subtask.id, convertSubtask(subtask)]),
      ),
    }),
    ...(journalProject.socks && { socks: journalProject.socks }),
  };
}

function convertSubtask({
  id,
  description,
  status,
  position,
}: JournalSubtask): Subtask {
  return { id, description, status, position };
}
