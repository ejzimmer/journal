type BlockPose = 'end' | 'side' | 'flat';

type PistolBox = {
  mats: number;
  blocks: BlockPose[];
};

export const PISTOL_BOX_LEVELS: PistolBox[] = [
  { mats: 0, blocks: [] },
  { mats: 1, blocks: [] },
  { mats: 2, blocks: [] },
  { mats: 3, blocks: [] },
  { mats: 3, blocks: ['flat'] },
  { mats: 3, blocks: ['flat', 'flat'] },
  { mats: 3, blocks: ['side', 'flat'] },
  { mats: 3, blocks: ['side', 'side'] },
  { mats: 3, blocks: ['end', 'side'] },
  { mats: 3, blocks: ['end', 'end'] },
];

export const STARTING_PISTOL_BOX_LEVEL = 6;

const TOP_LEVEL = PISTOL_BOX_LEVELS.length - 1;

export function lowerPistolBox(level: number) {
  return Math.max(0, level - 1);
}

export function raisePistolBox(level: number) {
  return Math.min(TOP_LEVEL, level + 1);
}

export function isBoxCleared(level: number) {
  return level === 0;
}
