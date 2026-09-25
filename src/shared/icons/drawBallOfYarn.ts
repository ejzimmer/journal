import {
  BALL_CENTRE,
  BALL_OUTLINE,
  BALL_RADIUS,
  BANDS,
  SHADING,
} from './ballOfYarnShape';

const STRAND = { width: 0.32, opacity: 0.26 };
const BAND_EDGE = { width: 0.45, opacity: 0.5 };

export function drawBallOfYarn(
  context: CanvasRenderingContext2D,
  colour: string,
) {
  const outline = new Path2D(BALL_OUTLINE);

  context.save();
  context.fillStyle = colour;
  context.fill(outline);
  context.clip(outline);
  BANDS.forEach((band) => drawBand(context, band, colour));
  context.restore();

  context.fillStyle = createShading(context);
  context.fill(outline);
}

function drawBand(
  context: CanvasRenderingContext2D,
  { angle, fill, edges, strands }: (typeof BANDS)[number],
  colour: string,
) {
  context.save();
  context.translate(BALL_CENTRE, BALL_CENTRE);
  context.rotate((angle * Math.PI) / 180);
  context.translate(-BALL_CENTRE, -BALL_CENTRE);

  if (fill) {
    context.fillStyle = colour;
    context.fill(new Path2D(fill));
  }
  strokePaths(context, strands, STRAND);
  strokePaths(context, edges, BAND_EDGE);

  context.restore();
}

function strokePaths(
  context: CanvasRenderingContext2D,
  paths: string[],
  { width, opacity }: { width: number; opacity: number },
) {
  context.lineWidth = width;
  context.strokeStyle = `rgb(0 0 0 / ${opacity})`;
  paths.forEach((path) => context.stroke(new Path2D(path)));
}

function createShading(context: CanvasRenderingContext2D) {
  const left = BALL_CENTRE - BALL_RADIUS;
  const size = BALL_RADIUS * 2;
  const x = left + size * SHADING.centreX;
  const y = left + size * SHADING.centreY;
  const gradient = context.createRadialGradient(
    x,
    y,
    0,
    x,
    y,
    size * SHADING.radius,
  );

  SHADING.stops.forEach(({ offset, rgb, opacity }) =>
    gradient.addColorStop(offset, `rgb(${rgb} / ${opacity})`),
  );

  return gradient;
}
