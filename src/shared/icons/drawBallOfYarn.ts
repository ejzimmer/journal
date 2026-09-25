import {
  BALL_CENTRE,
  BALL_OUTLINE,
  BALL_RADIUS,
  WINDING_EDGE,
  WINDINGS,
  darkenColour,
  SHADING,
  STRAND,
} from './ballOfYarnShape';

export function drawBallOfYarn(
  context: CanvasRenderingContext2D,
  colour: string,
) {
  const outline = new Path2D(BALL_OUTLINE);

  context.save();
  context.fillStyle = colour;
  context.fill(outline);
  context.clip(outline);
  WINDINGS.forEach((winding) => drawWinding(context, winding, colour));
  context.restore();

  context.fillStyle = createShading(context);
  context.fill(outline);
}

function drawWinding(
  context: CanvasRenderingContext2D,
  { angle, fill, edges, strands }: (typeof WINDINGS)[number],
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
  strokePaths(context, strands, STRAND, colour);
  strokePaths(context, edges, WINDING_EDGE, colour);

  context.restore();
}

function strokePaths(
  context: CanvasRenderingContext2D,
  paths: string[],
  { width, lightness }: { width: number; lightness: number },
  colour: string,
) {
  context.lineWidth = width;
  context.strokeStyle = darkenColour(colour, lightness);
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
