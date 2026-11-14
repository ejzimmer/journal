import { Project } from '../projects/types';

export function hasProjectDetails({ pattern, yarns, gauge }: Project) {
  return Boolean(
    pattern?.name ||
    pattern?.url ||
    Object.keys(yarns ?? {}).length ||
    gauge?.stitches ||
    gauge?.rows ||
    gauge?.needleMm,
  );
}
