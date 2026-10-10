import { PistolBox } from '../../shared/types';

export const BLOCK_POSES = ['end', 'side', 'flat'] as const;

export const STARTING_PISTOL_BOX: PistolBox = {
  mats: 3,
  blocks: [1, 2],
};

export function lowerBlock(box: PistolBox, index: number): PistolBox {
  const blocks = box.blocks ?? [];
  const lowerPose = blocks[index] + 1;
  return {
    ...box,
    blocks:
      lowerPose < BLOCK_POSES.length
        ? blocks.with(index, lowerPose)
        : blocks.toSpliced(index, 1),
  };
}

export function removeMat(box: PistolBox): PistolBox {
  return { ...box, mats: Math.max(0, box.mats - 1) };
}

export function isBoxCleared(box: PistolBox) {
  return box.mats === 0 && !box.blocks?.length;
}
