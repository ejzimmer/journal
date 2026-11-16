import { sortByPosition } from 'shared/drag-and-drop/utils';
import { Colourway, Gauge, Project, Yarn } from '../projects/types';
import { parseRavelryName } from '../projects/parseRavelryName';

// Number inputs hold strings so a half-typed value stays as typed, optional
// text is '' so inputs stay controlled, and rows are arrays in display order.
export type ColourwayDraft = Omit<
  Colourway,
  'skeins' | 'dyeLot' | 'position'
> & {
  skeins: string;
  dyeLot: string;
};

export type YarnDraft = Omit<Yarn, 'colourways' | 'position'> & {
  colourways: ColourwayDraft[];
};

export type GaugeDraft = Record<keyof Gauge, string>;

export type ProjectDraft = Omit<Project, 'pattern' | 'yarns' | 'gauge'> & {
  pattern: string;
  yarns: YarnDraft[];
  gauge: GaugeDraft;
};

// Saving writes each field separately, and null deletes it, so a field the
// user cleared has to be sent as null rather than left out.
type Removable<T> = { [K in keyof T]-?: T[K] | null };

export type ProjectFields = Pick<Project, 'name' | 'type'> &
  Removable<Pick<Project, 'craft' | 'pattern' | 'yarns' | 'gauge'>>;

export function createColourwayDraft(): ColourwayDraft {
  return { id: crypto.randomUUID(), name: '', skeins: '', dyeLot: '' };
}

export function createYarnDraft(): YarnDraft {
  return {
    id: crypto.randomUUID(),
    name: '',
    colourways: [createColourwayDraft()],
  };
}

export function createProjectDraft(project: Project): ProjectDraft {
  return {
    ...project,
    pattern: project.pattern?.url || project.pattern?.name || '',
    yarns: sortByPosition(Object.values(project.yarns ?? {})).map((yarn) => ({
      ...yarn,
      colourways: sortByPosition(Object.values(yarn.colourways ?? {})).map(
        (colourway) => ({
          ...colourway,
          skeins: String(colourway.skeins),
          dyeLot: colourway.dyeLot ?? '',
        }),
      ),
    })),
    gauge: {
      stitches: String(project.gauge?.stitches ?? ''),
      rows: String(project.gauge?.rows ?? ''),
      needleMm: String(project.gauge?.needleMm ?? ''),
    },
  };
}

export function convertDraftToFields(draft: ProjectDraft): ProjectFields {
  return {
    name: draft.name.trim(),
    type: draft.type,
    craft: draft.craft ?? null,
    pattern: convertPattern(draft.pattern),
    yarns: convertYarns(draft.yarns),
    gauge: convertGauge(draft.gauge),
  };
}

function convertPattern(draft: string) {
  const pattern = draft.trim();
  if (!pattern) return null;
  if (/^https?:\/\//.test(pattern)) {
    return parseRavelryName(pattern) ?? { url: pattern };
  }
  return { name: pattern };
}

function convertYarns(yarnDrafts: YarnDraft[]) {
  const yarns = yarnDrafts
    .map((yarnDraft) => ({
      name: yarnDraft.name.trim(),
      id: yarnDraft.id,
      colourways: yarnDraft.colourways
        .map(convertColourway)
        .filter((colourway) => colourway !== null),
    }))
    .filter((yarn) => yarn.name || yarn.colourways.length);
  if (!yarns.length) return null;

  return Object.fromEntries(
    yarns.map(({ colourways, ...yarn }, index): [string, Yarn] => [
      yarn.id,
      {
        ...yarn,
        position: index + 1,
        ...(colourways.length && {
          colourways: Object.fromEntries(
            colourways.map((colourway, colourwayIndex) => [
              colourway.id,
              { ...colourway, position: colourwayIndex + 1 },
            ]),
          ),
        }),
      },
    ]),
  );
}

function convertColourway(
  draft: ColourwayDraft,
): Omit<Colourway, 'position'> | null {
  const name = draft.name.trim();
  const dyeLot = draft.dyeLot.trim();
  const skeins = parseNumber(draft.skeins);
  if (!name && !dyeLot && skeins === undefined) return null;

  return {
    id: draft.id,
    name,
    skeins: skeins ?? 0,
    ...(dyeLot && { dyeLot }),
  };
}

function convertGauge(draft: GaugeDraft) {
  const gauge = withoutEmptyValues({
    stitches: parseNumber(draft.stitches),
    rows: parseNumber(draft.rows),
    needleMm: parseNumber(draft.needleMm),
  });
  return Object.keys(gauge).length ? gauge : null;
}

function parseNumber(value: string) {
  const number = parseFloat(value);
  return Number.isNaN(number) ? undefined : number;
}

function withoutEmptyValues<
  T extends Record<string, string | number | undefined>,
>(values: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(values).filter(
      ([, value]) => value !== undefined && value !== '',
    ),
  ) as Partial<T>;
}
