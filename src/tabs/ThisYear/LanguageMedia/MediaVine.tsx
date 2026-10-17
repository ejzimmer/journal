import { CSSProperties, useMemo } from 'react';
import { calculateEpisodeProgress } from './calculateEpisodeProgress';
import { Pergola } from './Pergola';
import { placeVineLeaves } from './placeVineLeaves';
import { PostFronts } from './PostFronts';
import { Signpost } from './Signpost';
import { TreeFill } from './TreeFill';
import { getGrownShapes } from './treeGrowth';
import { TreeOutline } from './TreeOutline';
import { TreeSilhouette } from './TreeSilhouette';
import { TvSeries } from './types';
import { VineLeaves } from './VineLeaves';
import { createVineLayout, getVineEpisodes } from './vineLayout';

const OUTLINE_WIDTH = 1;
const SIGN_GAP = 18;

export function MediaVine({ series }: { series: TvSeries }) {
  const layout = useMemo(() => createVineLayout(series), [series]);
  const progress = getVineEpisodes(series).flatMap(({ season, episodes }) =>
    episodes.map((episode) =>
      calculateEpisodeProgress(series, season, episode),
    ),
  );
  const grownShapes = getGrownShapes(layout, progress);
  const { x, y, width, height } = layout.bounds;

  return (
    <div
      className="media-tree media-vine"
      style={
        {
          '--ground': `${y + height}px`,
          '--tree-width': `${width}px`,
        } as CSSProperties
      }
    >
      <svg
        role="img"
        aria-label={series.name}
        viewBox={`${x} ${y} ${width} ${height}`}
        width={width}
        height={height}
      >
        <Pergola pergola={layout.pergola} />
        <TreeOutline shapes={grownShapes} width={OUTLINE_WIDTH} />
        <TreeSilhouette layout={layout} />
        <TreeFill shapes={grownShapes} />
        <PostFronts pergola={layout.pergola} />
        <VineLeaves
          leaves={placeVineLeaves(grownShapes, layout.pergola.beamBottom)}
        />
      </svg>
      <Signpost
        name={series.name}
        placement={{ side: 'left', offset: x + width / 2 + SIGN_GAP }}
      />
    </div>
  );
}
