import { CSSProperties, useMemo, useState } from 'react';
import { ModalDialog } from '../../../shared/controls/ModalDialog';
import { TelevisionIcon } from '../../../shared/icons/Television';
import { CloudFrame } from './CloudFrame';
import { EpisodeUpdateForm } from './EpisodeUpdateForm';
import { findCurrentEpisode } from './findCurrentEpisode';
import { HangingSign } from './HangingSign';
import { calculateEpisodeProgress } from './calculateEpisodeProgress';
import { getRacemes } from './getRacemes';
import { placeEpisodeBeetles } from './placeEpisodeBeetles';
import { Pergola } from './Pergola';
import { placeVineLeaves } from './placeVineLeaves';
import { PostFronts } from './PostFronts';
import { Signpost } from './Signpost';
import { TreeBeetles } from './TreeBeetles';
import { TreeFill } from './TreeFill';
import { getGrownShapes } from './treeGrowth';
import { TreeOutline } from './TreeOutline';
import { TreeSilhouette } from './TreeSilhouette';
import { TvSeries } from './types';
import { VineLeaves } from './VineLeaves';
import { VineRacemes } from './VineRacemes';
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
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);
  const currentEpisode = findCurrentEpisode(series);

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
        <VineRacemes layout={layout} racemes={getRacemes(series)} />
        <TreeBeetles spots={placeEpisodeBeetles(series, grownShapes)} />
      </svg>
      <Signpost
        name={series.name}
        placement={{ side: 'left', offset: x + width / 2 + SIGN_GAP }}
      >
        <HangingSign
          label="Update"
          icon={<TelevisionIcon width="18px" />}
          onClick={() => setIsUpdateFormOpen(true)}
        />
      </Signpost>
      <ModalDialog
        isOpen={isUpdateFormOpen}
        className="progress-update-modal episode-update-modal"
        onCancel={() => setIsUpdateFormOpen(false)}
      >
        {isUpdateFormOpen && currentEpisode && (
          <CloudFrame>
            <EpisodeUpdateForm
              series={series}
              season={currentEpisode.season}
              episode={currentEpisode.episode}
            />
          </CloudFrame>
        )}
      </ModalDialog>
    </div>
  );
}
