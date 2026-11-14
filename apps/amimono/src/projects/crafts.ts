import { JSX } from 'react';
import { CrochetIcon } from '../icons/CrochetIcon';
import { KnittingIcon } from '../icons/KnittingIcon';
import { WeavingIcon } from '../icons/WeavingIcon';
import { Craft } from './types';

export const CRAFTS: Record<Craft, { label: string; Icon: () => JSX.Element }> =
  {
    knitting: { label: 'Knitting', Icon: KnittingIcon },
    crochet: { label: 'Crochet', Icon: CrochetIcon },
    weaving: { label: 'Weaving', Icon: WeavingIcon },
  };
