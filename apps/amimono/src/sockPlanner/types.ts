export const RECIPIENTS_KEY = 'socks';

export type SockNumbers = {
  lengthMm: number;
  castOnStitches: number;
  startToeAtMm: number;
};

export type Recipient = {
  id: string;
  name: string;
  euSize: number;
  overrides?: Partial<SockNumbers>;
};
