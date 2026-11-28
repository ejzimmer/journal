export type RavelryYarn = {
  id: number;
  name: string;
};

export type RavelryColourway = {
  id: number;
  name: string;
  code?: string;
  photoUrl?: string;
};

export const RAVELRY_YARN_SEARCH_PATH = '/api/ravelry/yarns';
export const RAVELRY_COLOURWAYS_PATH = '/api/ravelry/colourways';
export const RAVELRY_COLOURWAY_COLOUR_PATH = '/api/ravelry/colourway-colour';
