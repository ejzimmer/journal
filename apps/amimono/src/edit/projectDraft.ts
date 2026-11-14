import { sortByPosition } from '../projects/sortByPosition';
import {
  Colourway,
  Craft,
  Gauge,
  Project,
  ProjectType,
  Yarn,
} from '../projects/types';

export type ColourwayDraft = {
  id: string;
  name: string;
  skeins: string;
  dyeLot: string;
};

export type YarnDraft = {
  id: string;
  name: string;
  colourways: ColourwayDraft[];
};

export type ProjectDraft = {
  name: string;
  type: ProjectType;
  craft?: Craft;
  patternName: string;
  patternUrl: string;
  yarns: YarnDraft[];
  stitches: string;
  rows: string;
  needleMm: string;
};

export type ProjectFields = {
  name: string;
  type: ProjectType;
  craft: Craft | null;
  pattern: Project['pattern'] | null;
  yarns: Record<string, Yarn> | null;
  gauge: Gauge | null;
};

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
    name: project.name,
    type: project.type,
    craft: project.craft,
    patternName: project.pattern?.name ?? '',
    patternUrl: project.pattern?.url ?? '',
    yarns: sortByPosition(Object.values(project.yarns ?? {})).map((yarn) => ({
      id: yarn.id,
      name: yarn.name,
      colourways: sortByPosition(Object.values(yarn.colourways ?? {})).map(
        (colourway) => ({
          id: colourway.id,
          name: colourway.name,
          skeins: String(colourway.skeins),
          dyeLot: colourway.dyeLot ?? '',
        }),
      ),
    })),
    stitches: String(project.gauge?.stitches ?? ''),
    rows: String(project.gauge?.rows ?? ''),
    needleMm: String(project.gauge?.needleMm ?? ''),
  };
}

export function convertDraftToFields(draft: ProjectDraft): ProjectFields {
  return {
    name: draft.name.trim(),
    type: draft.type,
    craft: draft.craft ?? null,
    pattern: convertPattern(draft),
    yarns: convertYarns(draft.yarns),
    gauge: convertGauge(draft),
  };
}

function convertPattern({ patternName, patternUrl }: ProjectDraft) {
  const pattern = withoutEmptyValues({
    name: patternName.trim(),
    url: patternUrl.trim(),
  });
  return Object.keys(pattern).length ? pattern : null;
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

function convertGauge(draft: ProjectDraft) {
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
