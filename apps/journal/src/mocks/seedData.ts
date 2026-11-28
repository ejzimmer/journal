import { getDateDaysAgo, getDateDaysAhead, getToday } from 'shared/dates';
import {
  LABELS_KEY,
  StoredLabel,
  WorkTask,
  WORK_KEY,
} from '../tabs/Work/types';
import {
  CALENDAR_KEY,
  CalendarTask,
  DAILY_KEY,
  DailyTask,
  Category,
  Exercise,
  ExerciseClass,
  HEALTH_PATH,
  ONCE_KEY,
  ProjectDetails,
  ProjectSubtask,
  PROJECTS_KEY,
  TODO_KEY,
  WEEKLY_KEY,
  WeeklyTask,
} from '../types';
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
  createProject('project-mending', 'Darn the jumper elbows', '🧶', 1, {
    status: 'in_progress',
    subtasks: indexById([
      createSubtask('subtask-wool', 'Find matching wool', '🧶', 0, 'done'),
      createSubtask('subtask-darn', 'Darn the holes', '🧶', 1),
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

function createWeeklyTask(
  id: string,
  description: string,
  category: string,
  frequency: number,
  daysAgoCompleted: number[],
  position: number,
): WeeklyTask {
  return {
    id,
    description,
    category,
    frequency,
    completed: daysAgoCompleted.map((days) => getDateDaysAgo(days)),
    parentId: WEEKLY_KEY,
    position,
  };
}

const stations = indexById(
  [
    { name: 'Heidelberg', distance: 8, isDone: true },
    { name: 'Rosanna', distance: 4.5, isDone: true },
    { name: 'Macleod', distance: 3, isDone: true },
    { name: 'Watsonia', distance: 0, isDone: true },
    { name: 'Greensborough', distance: 2, isDone: false },
    { name: 'Montmorency', distance: 5, isDone: false },
    { name: 'Eltham', distance: 8, isDone: false },
  ].map((station) => ({ id: station.name.toLowerCase(), ...station })),
);

const weeklyTasks = indexById([
  createWeeklyTask('weekly-run', 'Go for a run', '🏃‍♀️', 3, [0, 2], 0),
  createWeeklyTask('weekly-piano', 'Practise piano', '🎹', 5, [1, 3, 4], 1),
  createWeeklyTask('weekly-plants', 'Water the plants', '🪴', 2, [4], 2),
  createWeeklyTask('weekly-call', 'Call home', '📞', 1, [1], 3),
  createWeeklyTask('weekly-yoga', 'Yoga', '🧘', 4, [], 4),
]);

function createDailyTask(
  listId: string,
  id: string,
  description: string,
  category: string,
  type: DailyTask['type'],
  position: number,
): DailyTask {
  return {
    id,
    description,
    category,
    type,
    status: 'ready',
    lastCompleted: getToday(),
    parentId: listId,
    position,
  };
}

const dailyTasks = indexById([
  createDailyTask(DAILY_KEY, 'daily-meds', 'Take vitamins', '💊', '毎日', 0),
  createDailyTask(DAILY_KEY, 'daily-duo', 'Duolingo', '🦉', '毎日', 1),
]);

const onceTasks = indexById([
  createDailyTask(ONCE_KEY, 'once-parcel', 'Post the parcel', '📦', '一度', 0),
  createDailyTask(
    ONCE_KEY,
    'once-library',
    'Return library books',
    '📚',
    '一度',
    1,
  ),
]);

function createCalendarTask(
  id: string,
  description: string,
  category: string,
  daysUntilDue: number,
  status: CalendarTask['status'],
  position: number,
): CalendarTask {
  return {
    id,
    description,
    category,
    dueDate: getDateDaysAhead(daysUntilDue),
    status,
    statusUpdateDate: getToday(),
    parentId: CALENDAR_KEY,
    position,
  };
}

const calendarTasks = indexById([
  createCalendarTask('calendar-tax', 'Lodge tax return', '🧾', 0, 'ready', 0),
  createCalendarTask(
    'calendar-dentist',
    'Book the dentist',
    '🦷',
    3,
    'paused',
    1,
  ),
  createCalendarTask('calendar-bins', 'Clean the bins', '🏠', -2, 'ready', 3),
  createCalendarTask('calendar-plants', 'Repot the fern', '🌿', 1, 'ready', 4),
  createCalendarTask(
    'calendar-passport',
    'Renew passport',
    '🛂',
    24,
    'ready',
    5,
  ),
  createCalendarTask(
    'calendar-rego',
    'Renew car rego',
    '🚗',
    12,
    'finished',
    2,
  ),
]);

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
      seaChartQuandrants: {
        total: 49,
        revealedSquares: [
          3, 9, 10, 11, 16, 17, 18, 22, 23, 24, 25, 29, 30, 31, 32, 36, 37, 38,
          44, 45, 46,
        ],
      },
      charts: { chartCollected: 14, treasureCollected: 9, total: 41 },
      arrowCapacity: { current: 60, total: 99 },
      bombCapacity: { label: 'Bomb capacity', current: 30, total: 99 },
      walletCapacity: { current: 1000, total: 5000 },
      joyPendants: { label: 'Joy pendants', given: 20, total: 40 },
      blueChuJellies: {
        label: 'Blue Chu Jellies',
        collected: 7,
        total: 15,
      },
      bigOctos: { label: 'Big Octos', defeated: 3, total: 8 },
      membersCards: { label: "Members' cards", collected: 1, total: 10 },
      zunariShopDecorations: {
        label: 'Zunari shop decorations',
        collected: 2,
        total: 5,
      },
    },
  },
  [TODO_KEY]: {
    日: dailyTasks,
    一: onceTasks,
    週: weeklyTasks,
    暦: calendarTasks,
  },
  [PROJECTS_KEY]: projects,
  [HEALTH_PATH]: { exercises, classes },
  bikes: {
    '2026': [
      { name: 'BB-8', icon: '🤖', isDone: true },
      { name: 'Chiner Niner', icon: '🇨🇳', isDone: false },
      { name: 'Cyclocross', icon: '❌', isDone: false },
      { name: 'Dambala', icon: '👹', isDone: true },
      { name: 'Diverge', icon: '🚲', isDone: true },
      { name: 'Melburn Monster', icon: '🤡', isDone: false },
      { name: 'Moonraker', icon: '🚀', isDone: true },
      { name: 'Niner', icon: '🚵‍♀️', isDone: false },
      { name: 'ss road bike', icon: '🍺', isDone: true },
      { name: 'Uterus', icon: '📦', isDone: false },
    ],
  },
  '2026': {
    adventures,
    stations,
  },
  adventure_modes: adventureModes,
};
