import { RAVELRY_YARN_SEARCH_PATH, RavelryYarn } from '../../src/ravelry/types';

const RAVELRY_YARN_SEARCH_URL = 'https://api.ravelry.com/yarns/search.json';
const RESULT_COUNT = '10';

type RavelrySearchResponse = {
  yarns: { id: number; name: string; yarn_company_name?: string }[];
};

export default async function searchRavelryYarns(
  request: Request,
): Promise<Response> {
  const query = new URL(request.url).searchParams.get('query')?.trim();
  if (!query) return Response.json({ yarns: [] });

  const searchUrl = new URL(RAVELRY_YARN_SEARCH_URL);
  searchUrl.searchParams.set('query', query);
  searchUrl.searchParams.set('page_size', RESULT_COUNT);

  const ravelryResponse = await fetch(searchUrl, {
    headers: { Authorization: `Basic ${encodeCredentials()}` },
  });
  if (!ravelryResponse.ok) {
    return new Response(null, { status: 502 });
  }

  const { yarns } = (await ravelryResponse.json()) as RavelrySearchResponse;
  const results: RavelryYarn[] = yarns.map((yarn) => ({
    id: yarn.id,
    name: [yarn.yarn_company_name, yarn.name].filter(Boolean).join(' '),
  }));
  return Response.json(
    { yarns: results },
    { headers: { 'Cache-Control': 'public, max-age=86400' } },
  );
}

function encodeCredentials() {
  const username = process.env.RAVELRY_READ_ONLY_USERNAME;
  const password = process.env.RAVELRY_READ_ONLY_PASSWORD;
  return btoa(`${username}:${password}`);
}

export const config = { path: RAVELRY_YARN_SEARCH_PATH };
