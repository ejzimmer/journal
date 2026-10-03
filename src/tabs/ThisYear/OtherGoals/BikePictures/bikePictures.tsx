import { ReactElement } from 'react';
import { BB8 } from './BB8';
import { Panda } from './Panda';
import { KnobblyWheel } from './KnobblyWheel';
import { Snake } from './Snake';
import { SpecializedLogo } from './SpecializedLogo';
import { Cobblestones } from './Cobblestones';
import { DoubleOhSeven } from './DoubleOhSeven';
import { Chainring } from './Chainring';
import { Pint } from './Pint';
import { Ute } from './Ute';

export const bikePictures: Record<string, ReactElement> = {
  'BB-8': <BB8 />,
  'Chiner Niner': <Panda />,
  Cyclocross: <KnobblyWheel />,
  Dambala: <Snake />,
  Diverge: <SpecializedLogo />,
  'Melburn Monster': <Cobblestones />,
  Moonraker: <DoubleOhSeven />,
  Niner: <Chainring />,
  'ss road bike': <Pint />,
  Uterus: <Ute />,
};
