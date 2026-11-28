const SAMPLES_PER_SIDE = 100;
const BUCKET_SHIFT = 5;
const SAME_COLOUR_DISTANCE = 48;

type Image = {
  width: number;
  height: number;
  data: Uint8Array;
};

type Rgb = [number, number, number];

// Yarn photos are usually framed with the yarn in the middle, so only the
// central half of the image is sampled to keep the background out.
export function findMainColour(image: Image): string {
  const samples = sampleCentre(image);
  const commonest = averageColours(findBiggestBucket(samples));
  const shades = samples.filter(
    (sample) => measureDistance(sample, commonest) < SAME_COLOUR_DISTANCE,
  );
  return formatHexColour(averageColours(shades));
}

function sampleCentre({ width, height, data }: Image) {
  const samples: Rgb[] = [];
  const step = Math.max(1, Math.floor(width / 2 / SAMPLES_PER_SIDE));
  for (let y = Math.floor(height / 4); y < (height * 3) / 4; y += step) {
    for (let x = Math.floor(width / 4); x < (width * 3) / 4; x += step) {
      const offset = (y * width + x) * 4;
      samples.push([data[offset], data[offset + 1], data[offset + 2]]);
    }
  }
  return samples;
}

function findBiggestBucket(samples: Rgb[]) {
  const buckets = new Map<string, Rgb[]>();
  for (const sample of samples) {
    const key = sample.map((channel) => channel >> BUCKET_SHIFT).join();
    buckets.set(key, [...(buckets.get(key) ?? []), sample]);
  }
  return [...buckets.values()].reduce((biggest, bucket) =>
    bucket.length > biggest.length ? bucket : biggest,
  );
}

function averageColours(colours: Rgb[]): Rgb {
  const totals = colours.reduce(
    (sum, colour) => sum.map((total, index) => total + colour[index]) as Rgb,
    [0, 0, 0],
  );
  return totals.map((total) => Math.round(total / colours.length)) as Rgb;
}

function measureDistance(first: Rgb, second: Rgb) {
  return Math.hypot(...first.map((channel, index) => channel - second[index]));
}

function formatHexColour(colour: Rgb) {
  return `#${colour.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}
