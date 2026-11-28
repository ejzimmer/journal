import { RavelryColourway } from '../../src/ravelry/types';
import { createRavelryAuthHeader } from '../ravelryCredentials';

type RavelryYarnResponse = {
  colorways?: {
    id: number;
    name: string;
    code?: string | null;
    photo_url?: string | null;
  }[];
};

export default async function getRavelryColourways(
  request: Request,
): Promise<Response> {
  const yarnId = Number(new URL(request.url).searchParams.get('yarnId'));
  if (!Number.isInteger(yarnId) || yarnId <= 0) {
    return new Response(null, { status: 400 });
  }

  const ravelryResponse = await fetch(
    `https://api.ravelry.com/yarns/${yarnId}.json?include=colorways`,
    { headers: createRavelryAuthHeader() },
  );
  if (!ravelryResponse.ok) {
    return new Response(null, { status: 502 });
  }

  const { colorways = [] } =
    (await ravelryResponse.json()) as RavelryYarnResponse;
  const colourways: RavelryColourway[] = colorways.map((colorway) => ({
    id: colorway.id,
    name: colorway.name,
    ...(colorway.code && { code: colorway.code }),
    ...(colorway.photo_url && { photoUrl: colorway.photo_url }),
  }));
  return Response.json(
    { colourways },
    { headers: { 'Cache-Control': 'public, max-age=86400' } },
  );
}

// Netlify reads this statically at deploy time, so the path has to be a
// literal rather than an imported constant.
export const config = { path: '/api/ravelry/colourways' };
