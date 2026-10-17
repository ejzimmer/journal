export type Bike = { name: string; icon: string; isDone: boolean };
export type StoredBikesByYear = Record<string, Bike[]>;

export const BIKES_PATH = 'bikes';

export const getBikesPath = (year: number) => `${BIKES_PATH}/${year}`;
