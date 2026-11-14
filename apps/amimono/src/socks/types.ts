export const SOCKS = ['first', 'second'] as const;
export type Sock = (typeof SOCKS)[number];
export type SockDirection = 'cuff_down' | 'toe_up';
export type SockProgress = {
  direction: SockDirection;
  knittedSections: Record<Sock, number>;
};
