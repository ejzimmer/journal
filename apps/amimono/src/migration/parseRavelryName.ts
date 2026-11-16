const RAVELRY_PATTERN_URL = 'https://www.ravelry.com/patterns/library/';
const RAVELRY_LINK = /ravelry\.com\/patterns\/library\/([\w-]+)/;
const TRELLO_COPY_OF_RAVELRY_LINK = /wwwravelrycom-patterns-library-([\w-]+)/;

export function parseRavelryName(name: string) {
  const slug = (name.match(RAVELRY_LINK) ??
    name.match(TRELLO_COPY_OF_RAVELRY_LINK))?.[1];
  if (!slug) return undefined;

  const patternName = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return { name: patternName, url: `${RAVELRY_PATTERN_URL}${slug}` };
}
