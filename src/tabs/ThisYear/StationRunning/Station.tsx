export type StationDetails = {
  id: string;
  name: string;
  distance: number;
  isDone: boolean;
};

type StationProps = StationDetails & {
  onChange: (station: StationDetails) => void;
};

export function Station({ onChange, ...station }: StationProps) {
  return (
    <label className={`station ${station.isDone ? 'done' : ''}`}>
      <div className="name">
        <b>{station.name}</b>{' '}
        <span className="distance">{station.distance}km</span>
        <input
          type="checkbox"
          checked={station.isDone}
          onChange={() => onChange({ ...station, isDone: !station.isDone })}
        />
      </div>
    </label>
  );
}
