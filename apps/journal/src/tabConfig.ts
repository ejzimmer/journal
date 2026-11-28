import { Today } from './tabs/Today';
import { Projects } from './tabs/Projects';
import { Work } from './tabs/Work';
import { Media } from './tabs/Media';
import { ThisYear } from './tabs/ThisYear';
import { Health } from './tabs/Health';

export const TABS = [
  { path: 'today', Element: Today },
  { path: 'todo', Element: ThisYear },
  { path: 'health', Element: Health },
  { path: 'projects', Element: Projects },
  { path: 'media', Element: Media },
  { path: 'work', Element: Work },
];
