import './GaugeSummary.css';
import { Gauge } from '../projects/types';
import gaugeIcon from './icons/gauge.svg';

type GaugeSummaryProps = {
  gauge: Gauge;
};

export function GaugeSummary({ gauge }: GaugeSummaryProps) {
  const { stitches, rows, needleMm } = gauge;

  return (
    <div className="gauge-summary">
      {Boolean(stitches || rows) && (
        <div
          className="gauge-swatch"
          role="img"
          aria-label={describeGauge(stitches, rows)}
        >
          <img src={gaugeIcon} alt="" />
          {!!rows && <span className="gauge-rows">{rows}</span>}
          {!!stitches && <span className="gauge-stitches">{stitches}</span>}
        </div>
      )}
      {!!needleMm && <span className="needle-size">{needleMm} mm</span>}
    </div>
  );
}

function describeGauge(stitches?: number, rows?: number) {
  const counts = [
    stitches && `${stitches} stitches`,
    rows && `${rows} rows`,
  ].filter(Boolean);
  return `Gauge: ${counts.join(' and ')} per 10 cm`;
}
