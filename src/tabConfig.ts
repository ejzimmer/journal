import { Todo } from "./tabs/Todo"
import { Projects } from "./tabs/Projects"
import { Work } from "./tabs/Work"
import { Media } from "./tabs/Media"
import { ThisYear } from "./tabs/ThisYear"

export const TABS = [
  { path: "todo", Element: Todo },
  { path: "2026", Element: ThisYear },
  { path: "projects", Element: Projects },
  { path: "media", Element: Media },
  { path: "work", Element: Work },
]
