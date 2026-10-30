import { useStorageContext } from '../../../shared/FirebaseContext';
import './StationRunning.css';
import { Station, StationDetails } from './Station';

export const STATION_RUNNING_YEAR = 2026;
const KEY = `${STATION_RUNNING_YEAR}/stations`;

export function StationRunning() {
  const { useValue, updateItem } = useStorageContext();

  const { value } = useValue<Record<string, StationDetails>>(KEY);
  const stations = value && Object.values(value);

  return (
    <div
      style={{
        maxWidth: '100%',
        overflow: 'auto',
        paddingBlockEnd: '4px',
        marginInline: 'auto',
        paddingInlineEnd: '120px',
      }}
    >
      <ol className="trainline">
        {stations?.map((station) => (
          <li
            key={station.name}
            className={station.name === 'Watsonia' ? 'home' : ''}
          >
            <Station
              {...station}
              onChange={(station) => updateItem(KEY, station)}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
