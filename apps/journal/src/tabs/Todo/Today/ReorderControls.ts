import { Destination } from 'shared/drag-and-drop/types';

export type ReorderControls = {
  isFirst: boolean;
  isLast: boolean;
  move: (destination: Destination) => void;
};
