import { BlockPose, PistolBox } from '../../shared/types';

export const STARTING_PISTOL_BOX: PistolBox = {
  mats: 3,
  blocks: ['side', 'flat'],
};

const LOWER_POSES: Record<BlockPose, BlockPose | undefined> = {
  end: 'side',
  side: 'flat',
  flat: undefined,
};

export function lowerBlock(box: PistolBox, index: number): PistolBox {
  const blocks = box.blocks ?? [];
  const lowerPose = LOWER_POSES[blocks[index]];
  return {
    ...box,
    blocks: lowerPose
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
