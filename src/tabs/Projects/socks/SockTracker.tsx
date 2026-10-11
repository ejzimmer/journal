import { RefObject } from 'react';
import { useStorageContext } from '../../../shared/FirebaseContext';
import { SOCKS, Sock, SockProgress } from '../../../shared/types';
import { DirectionSwitch } from './DirectionSwitch';
import { SockPicture } from './SockPicture';
import { clampKnittedCount, getSocksKey } from './sockProgress';
import { SOCK_PAIR_VIEWBOX } from './sockShape';

import './SockTracker.css';

type SockTrackerProps = {
  projectId: string;
  socks: SockProgress;
  trackerRef: RefObject<HTMLDivElement | null>;
};

export function SockTracker({
  projectId,
  socks,
  trackerRef,
}: SockTrackerProps) {
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
    <div className="sock-tracker" ref={trackerRef}>
      <svg className="sock-pair" viewBox={SOCK_PAIR_VIEWBOX}>
        {SOCKS.map((sock) => (
          <SockPicture
            key={sock}
            sock={sock}
            direction={socks.direction}
            knittedCount={socks.knittedSections[sock]}
            onChangeKnittedCount={(count) => setKnittedCount(sock, count)}
          />
        ))}
      </svg>
      <DirectionSwitch
        value={socks.direction}
        onChange={(direction) => saveSocks({ ...socks, direction })}
      />
    </div>
  );
}
