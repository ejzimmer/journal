import './YarnSummary.css';
import { Yarn } from '../projects/types';
import { ColourwayRow } from './ColourwayRow';

type YarnSummaryProps = {
  yarn: Yarn;
};

export function YarnSummary({ yarn }: YarnSummaryProps) {
  return (
    <div className="yarn-summary">
      <span className="yarn-name">{yarn.name}</span>
      {Object.values(yarn.colourways ?? {}).map((colourway) => (
        <ColourwayRow key={colourway.id} colourway={colourway} />
      ))}
    </div>
  );
}
