import { decode } from 'jpeg-js';

import { findMainColour } from '../../src/ravelry/findMainColour';

const RAVELRY_IMAGE_HOSTS = ['ravelrycache.com', 'ravelry.com'];

export default async function getRavelryColourwayColour(
  request: Request,
): Promise<Response> {
  const photoUrl = parseRavelryPhotoUrl(
    new URL(request.url).searchParams.get('photoUrl'),
  );
  if (!photoUrl) return new Response(null, { status: 400 });

  const photoResponse = await fetch(photoUrl);
  if (!photoResponse.ok) return new Response(null, { status: 502 });

  try {
    const image = decode(new Uint8Array(await photoResponse.arrayBuffer()), {
      useTArray: true,
      formatAsRGBA: true,
      maxResolutionInMP: 20,
    });
    return Response.json(
      { colour: findMainColour(image) },
      { headers: { 'Cache-Control': 'public, max-age=31536000' } },
    );
  } catch {
    return new Response(null, { status: 415 });
  }
}

function parseRavelryPhotoUrl(photoUrl: string | null) {
  if (!photoUrl || !URL.canParse(photoUrl)) return undefined;
  const url = new URL(photoUrl);
  const isRavelryHost = RAVELRY_IMAGE_HOSTS.some(
    (host) => url.hostname === host || url.hostname.endsWith(`.${host}`),
  );
  return url.protocol === 'https:' && isRavelryHost ? url : undefined;
}

// Netlify reads this statically at deploy time, so the path has to be a
// literal rather than an imported constant.
export const config = { path: '/api/ravelry/colourway-colour' };
