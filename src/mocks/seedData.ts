import { getToday } from '../shared/dates';
import {
  LABELS_KEY,
  StoredLabel,
  WorkTask,
  WORK_KEY,
} from '../tabs/Work/types';
import {
  Category,
  Exercise,
  ExerciseClass,
  HEALTH_PATH,
  ProjectDetails,
  ProjectSubtask,
  PROJECTS_KEY,
} from '../shared/types';
import { StoredYarn } from '../tabs/ThisYear/YarnTracking/types';
import { LanguageMedia } from '../tabs/ThisYear/LanguageMedia/types';
import { Adventure, AdventureMode } from '../tabs/ThisYear/Adventures/types';
import {
  BookDetails,
  GameDetails,
  PlayingItemDetails,
  ReadingItemDetails,
  SeriesDetails,
} from '../tabs/Media/types';

const todaysDate = getToday();

function createList(
  id: string,
  description: string,
  position: number,
): WorkTask {
  return {
    id,
    description,
    status: 'not_started',
    parentId: WORK_KEY,
    lastStatusUpdate: todaysDate,
    position,
  };
}

function createTask(
  listId: string,
  id: string,
  description: string,
  position: number,
  extra: Partial<WorkTask> = {},
): WorkTask {
  return {
    id,
    description,
    status: 'not_started',
    parentId: `${WORK_KEY}/${listId}/items`,
    lastStatusUpdate: todaysDate,
    position,
    ...extra,
  };
}

const backlog = createList('list-backlog', 'Backlog', 0);
const today = createList('list-today', 'Today', 1);
const done = createList('list-done', 'Done', 2);

const backlogTask = createTask(
  backlog.id,
  'task-backlog-1',
  'Set up the mock backend',
  0,
);

const demoLabel: StoredLabel = {
  id: 'label-demo',
  value: 'demo',
  colour: 'blue',
};
const otherLabel: StoredLabel = {
  id: 'label-other',
  value: 'other',
  colour: 'orange',
};

const todayTask = createTask(
  today.id,
  'task-today-1',
  'Try dragging this task',
  0,
  { labelIds: [demoLabel.id] },
);

const doneTask = createTask(done.id, 'task-done-1', 'See how Done looks', 0, {
  status: 'done',
});

const createBook = (
  id: string,
  title: string,
  extra: Partial<BookDetails> = {},
): BookDetails => ({ id, type: 'book', title, ...extra });

const createGame = (
  id: string,
  title: string,
  extra: Partial<GameDetails> = {},
): GameDetails => ({ id, type: 'game', title, ...extra });

const indexById = <T extends { id: string }>(items: T[]): Record<string, T> =>
  items.reduce(
    (map, item) => {
      map[item.id] = item;
      return map;
    },
    {} as Record<string, T>,
  );

const createBookSeries = (
  id: string,
  name: string,
  books: BookDetails[],
): SeriesDetails<BookDetails> => ({
  id,
  type: 'series',
  name,
  items: indexById(books),
});

const createGameSeries = (
  id: string,
  name: string,
  games: GameDetails[],
): SeriesDetails<GameDetails> => ({
  id,
  type: 'series',
  name,
  items: indexById(games),
});

const books = indexById<ReadingItemDetails>([
  createBookSeries('series-discworld', 'Discworld', [
    createBook('book-guards', 'Guards! Guards!', {
      author: 'Terry Pratchett',
      status: 'read',
    }),
    createBook('book-witches', 'Witches Abroad', {
      author: 'Terry Pratchett',
      status: 'read',
    }),
    createBook('book-nightwatch', 'Night Watch', {
      author: 'Terry Pratchett',
      status: 'listening',
    }),
    createBook('book-thud', 'Thud!', { author: 'Terry Pratchett' }),
  ]),
  createBook('book-nation', 'Nation', {
    author: 'Terry Pratchett',
    status: 'read',
  }),
  createBookSeries('series-earthsea', 'Earthsea', [
    createBook('book-wizard', 'A Wizard of Earthsea', {
      author: 'Ursula Le Guin',
      status: 'read',
    }),
    createBook('book-tombs', 'The Tombs of Atuan', {
      author: 'Ursula Le Guin',
      status: 'reading',
    }),
    createBook('book-shore', 'The Farthest Shore', {
      author: 'Ursula Le Guin',
    }),
  ]),
  createBook('book-lefthand', 'The Left Hand of Darkness', {
    author: 'Ursula Le Guin',
    status: 'read',
  }),
  createBook('book-dispossessed', 'The Dispossessed', {
    author: 'Ursula Le Guin',
  }),
  createBookSeries('series-lockedtomb', 'The Locked Tomb', [
    createBook('book-gideon', 'Gideon the Ninth', {
      author: 'Tamsyn Muir',
      status: 'read',
    }),
    createBook('book-harrow', 'Harrow the Ninth', {
      author: 'Tamsyn Muir',
      status: 'listening',
    }),
    createBook('book-nona', 'Nona the Ninth', { author: 'Tamsyn Muir' }),
  ]),
  createBook('book-frankenstein', 'Frankenstein', { author: 'Mary Shelley' }),
  createBook('book-linguist-mages', 'The Linguist Mages'),
]);

const games = indexById<PlayingItemDetails>([
  createGameSeries('series-zelda', 'The Legend of Zelda', [
    createGame('game-botw', 'Breath of the Wild', { status: 'played' }),
    createGame('game-totk', 'Tears of the Kingdom', { status: 'playing' }),
    createGame('game-echoes', 'Echoes of Wisdom'),
  ]),
  createGameSeries('series-portal', 'Portal', [
    createGame('game-portal', 'Portal', { status: 'played' }),
    createGame('game-portal2', 'Portal 2', { status: 'played' }),
  ]),
  createGame('game-stardew', 'Stardew Valley', { status: 'playing' }),
  createGame('game-hades', 'Hades'),
  createGame('game-outer-wilds', 'Outer Wilds'),
]);

const createSubtask = (
  id: string,
  description: string,
  category: Category,
  position: number,
  status: ProjectSubtask['status'] = 'ready',
): ProjectSubtask => ({ id, description, category, position, status });

const createProject = (
  id: string,
  description: string,
  category: Category,
  position: number,
  extra: Partial<ProjectDetails> = {},
): ProjectDetails => ({
  id,
  description,
  category,
  position,
  parentId: PROJECTS_KEY,
  ...extra,
});

const projects = indexById<ProjectDetails>([
  createProject('project-shelves', 'Put up the hallway shelves', '🚚', 0, {
    status: 'in_progress',
    subtasks: indexById([
      createSubtask('subtask-brackets', 'Buy brackets', '🚚', 0, 'done'),
      createSubtask('subtask-drill', 'Borrow a drill', '🚚', 1),
      createSubtask('subtask-paint', 'Paint the boards', '🚚', 2),
    ]),
  }),
  createProject('project-socks', 'Knit the striped socks', '🧶', 1, {
    subtasks: indexById([
      createSubtask('subtask-yarn', 'Wind the yarn', '🧶', 0),
      createSubtask('subtask-heel', 'Learn a better heel', '🧶', 1),
    ]),
  }),
  createProject('project-quilt', 'Finish the quilt binding', '🪡', 2),
  createProject('project-groceries', "Plan the week's meals", '🛒', 3),
  createProject('project-journal', 'Write up the trip notes', '📓', 4, {
    subtasks: indexById([
      createSubtask('subtask-photos', 'Pick the photos', '📓', 0),
    ]),
  }),
  createProject('project-blog', 'Redesign the projects tab', '👩‍💻', 5, {
    status: 'in_progress',
    subtasks: indexById([
      createSubtask('subtask-spec', 'Agree the spec', '👩‍💻', 0, 'done'),
      createSubtask('subtask-cards', 'Restyle the cards', '👩‍💻', 1),
    ]),
  }),
  createProject('project-desk', 'Clear off the desk', '🧹', 6, {
    status: 'done',
  }),
  createProject('project-letters', 'Reply to the birthday cards', '🖊️', 7),
  createProject('project-boxes', 'Unpack the last boxes', '🚚', 8, {
    status: 'done',
    subtasks: indexById([
      createSubtask('subtask-books', 'Shelve the books', '🚚', 0, 'done'),
      createSubtask('subtask-flatten', 'Flatten the cartons', '🚚', 1, 'done'),
    ]),
  }),
]);

const yarn: StoredYarn = {
  wool: {
    id: 'wool',
    history: {
      '2026-01': 4732,
      '2026-03': 4380,
      '2026-06': 3910,
      '2026-09': 3520,
    },
  },
  cotton: {
    id: 'cotton',
    history: { '2026-01': 420, '2026-04': 365, '2026-07': 300 },
  },
  acrylic: {
    id: 'acrylic',
    history: { '2026-01': 246, '2026-06': 180, '2026-09': 95 },
  },
  'sock yarn': {
    id: 'sock yarn',
    history: {
      '2026-01': 2641,
      '2026-02': 2480,
      '2026-05': 2150,
      '2026-08': 1890,
    },
  },
};

const exercises: Record<string, Exercise> = {
  'exercise-pistol': {
    id: 'exercise-pistol',
    name: 'Box pistol squat',
    updates: {
      a: {
        id: 'a',
        date: '2026-08-12',
        details:
          '2 x 5 x 3 mats + 1 low yoga block + 1 high yoga block, 1 x 5 3 mats + 2 low yoga blocks (eccentric only)',
      },
    },
  },
  'exercise-split': {
    id: 'exercise-split',
    name: 'Bulgarian split squat',
    updates: {
      a: {
        id: 'a',
        date: '2026-08-12',
        details: '3 x 10 x 8kg',
      },
    },
  },
  'exercise-rdl': {
    id: 'exercise-rdl',
    name: 'B-stance RDL',
    updates: {
      a: {
        id: 'a',
        date: '2026-08-12',
        details: '3 x 10 x 16kg',
        recommendation: 'increase',
      },
      b: { id: 'b', date: '2026-08-15', details: '3 x 10 x 20kg' },
      c: {
        id: 'c',
        date: '2026-08-17',
        details: '3 x 10 x 20kg',
        recommendation: 'decrease',
      },
    },
  },
};

const classes: Record<string, ExerciseClass> = {
  'class-wheel': {
    id: 'class-wheel',
    description: 'Wheel class',
    blocks: [{ id: 'all', total: 30, completed: [0, 1, 2, 3, 4, 5] }],
  },
  'class-pistol': {
    id: 'class-pistol',
    description: 'Progress to Pistol Squat',
    blocks: [
      { id: 'week-1', total: 6, completed: [0, 1, 2, 3, 4, 5] },
      { id: 'week-2', total: 6, completed: [0, 1, 2] },
    ],
  },
};

const languageMedia: Record<string, LanguageMedia> = {
  lupin: {
    id: 'lupin',
    type: 'tv',
    name: 'Lupin',
    language: 'french',
    seasons: {
      s1: {
        id: 's1',
        number: 1,
        episodes: {
          e1: {
            id: 'e1',
            number: 1,
            name: 'Chapitre 1',
            lengthInSeconds: 2826,
            lookups: 12,
            aiQuestions: 2,
            understood: 70,
          },
          e2: {
            id: 'e2',
            number: 2,
            lookups: 4,
            aiQuestions: 0,
            status: 'in-progress',
          },
        },
      },
      s2: { id: 's2', number: 2 },
    },
    upTo: { season: 1, episode: 2, timestampInSeconds: 754 },
  },
  hugo: {
    id: 'hugo',
    type: 'youtube',
    name: 'HugoDécrypte',
    language: 'french',
    videos: {
      v1: {
        id: 'v1',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        lengthInSeconds: 3725,
        upToInSeconds: 1200,
        lookups: 7,
        aiQuestions: 1,
      },
    },
  },
  yotsuba: {
    id: 'yotsuba',
    type: 'manga',
    name: 'よつばと！',
    language: 'japanese',
    volumes: {
      vol1: {
        id: 'vol1',
        number: 1,
        pages: 220,
        lookups: 20,
        aiQuestions: 3,
        understood: 60,
      },
      vol2: {
        id: 'vol2',
        number: 2,
        lookups: 0,
        aiQuestions: 0,
        status: 'not-started',
      },
    },
    upTo: { volume: 1, page: 41 },
  },
};

const adventureModes: Record<string, AdventureMode> = {
  running: { id: 'running', name: 'Running', emoji: '🏃', colour: '#d11c2e' },
  cycling: { id: 'cycling', name: 'Cycling', emoji: '🚲', colour: '#2a9940' },
};

const adventures: Record<string, Adventure> = {
  parkrun: {
    id: 'parkrun',
    description: 'Plenty Gorge parkrun',
    modeId: 'running',
    isDone: false,
    plannedDate: '2026-10-17',
  },
  hurstbridge: {
    id: 'hurstbridge',
    description: 'Ride to Hurstbridge',
    modeId: 'cycling',
    isDone: true,
  },
  yarraTrail: {
    id: 'yarraTrail',
    description: 'Yarra Trail from Watsonia to Southbank',
    modeId: 'cycling',
    isDone: false,
    plannedDate: '2026-10-08',
  },
  merriCreek: {
    id: 'merriCreek',
    description: 'Run the whole Merri Creek Trail',
    modeId: 'running',
    isDone: false,
  },
};

export const seedData = {
  [WORK_KEY]: {
    [backlog.id]: { ...backlog, items: { [backlogTask.id]: backlogTask } },
    [today.id]: {
      ...today,
      labelIds: [demoLabel.id],
      items: { [todayTask.id]: todayTask },
    },
    [done.id]: { ...done, items: { [doneTask.id]: doneTask } },
  },
  [LABELS_KEY]: {
    [demoLabel.id]: demoLabel,
    [otherLabel.id]: otherLabel,
  },
  media: {
    books,
    games,
    wind_waker: {
      hearts: { collected: 13, total: 20 },
      bottles: { collected: 2, total: 4 },
      magicMeterDouble: { label: 'Double magic meter', completed: true },
      bluePotion: { label: 'Blue potion', unlocked: false },
      greenPotion: { label: 'Green potion', unlocked: true },
      songOfPassing: { label: 'Song of Passing', learnt: true },
      spinAttack: { label: 'Spin attack', learnt: true },
      herosCharm: { label: "Hero's Charm", collected: false },
      magicArmour: { label: 'Magic armour', collected: false },
      cureGrandma: { label: 'Cure Grandma', cured: true },
      seaChartQuandrants: { revealed: 21, total: 49 },
      charts: { chartCollected: 14, treasureCollected: 9, total: 41 },
      arrowCapacity: { current: 60, total: 99 },
      bombCapacity: { label: 'Bomb capacity', current: 30, total: 99 },
      walletCapacity: { current: 1000, total: 5000 },
      joyPendants: { label: 'Joy pendants', given: 20, total: 40 },
      blueChuJellies: { label: 'Blue Chu Jellies', collected: 7, total: 15 },
      bigOctos: { label: 'Big Octos', defeated: 3, total: 8 },
      membersCards: { label: "Members' cards", collected: 1, total: 10 },
      zunariShopDecorations: {
        label: 'Zunari shop decorations',
        collected: 2,
        total: 5,
      },
    },
  },
  [PROJECTS_KEY]: projects,
  [HEALTH_PATH]: { exercises, classes },
  yarn: { '2026': yarn },
  language_media: { '2026': languageMedia },
  '2026': {
    adventures,
  },
  adventure_modes: adventureModes,
};
