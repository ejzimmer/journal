import { useStorageContext } from 'shared/FirebaseContext';
import { SOCKS, Sock, SockProgress } from './types';
import { DirectionSwitch } from './DirectionSwitch';
import { SockPicture } from './SockPicture';
import { clampKnittedCount, getSocksKey } from './sockProgress';
import { SockNumbers } from '../sockPlanner/types';
import { SockAnnotations } from './SockAnnotations';
import { ANNOTATED_SOCK_PAIR_VIEWBOX, SOCK_PAIR_VIEWBOX } from './sockShape';

import './SockTracker.css';

type SockTrackerProps = {
  projectId: string;
  socks: SockProgress;
  numbers?: SockNumbers;
};

export function SockTracker({ projectId, socks, numbers }: SockTrackerProps) {
  const isAnnotated = numbers && socks.direction === 'cuff_down';

  const { setValue } = useStorageContext();

  const saveSocks = (nextSocks: SockProgress) =>
    setValue<SockProgress>(getSocksKey(projectId), nextSocks);

  const setKnittedCount = (sock: Sock, count: number) =>
    saveSocks({
      ...socks,
      knittedSections: {
        ...socks.knittedSections,
        [sock]: clampKnittedCount(count),
      },
    });

  return (
    <div className="sock-tracker">
      <svg
        className={`sock-pair ${isAnnotated ? 'annotated' : ''}`}
        viewBox={isAnnotated ? ANNOTATED_SOCK_PAIR_VIEWBOX : SOCK_PAIR_VIEWBOX}
      >
        {SOCKS.map((sock) => (
          <SockPicture
            key={sock}
            sock={sock}
            direction={socks.direction}
            knittedCount={socks.knittedSections[sock]}
            onChangeKnittedCount={(count) => setKnittedCount(sock, count)}
          />
        ))}
        {isAnnotated && <SockAnnotations numbers={numbers} />}
      </svg>
      <DirectionSwitch
        value={socks.direction}
        onChange={(direction) => saveSocks({ ...socks, direction })}
      />
    </div>
  );
}
