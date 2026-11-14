import accessoryIcon from './icons/accessory.svg';
import amigurumiIcon from './icons/amigurumi.svg';
import blanketIcon from './icons/blanket.svg';
import cardiganIcon from './icons/cardigan.svg';
import hatIcon from './icons/hat.svg';
import jumperIcon from './icons/jumper.svg';
import shawlIcon from './icons/shawl.svg';
import socksIcon from './icons/socks.svg';
import vestIcon from './icons/vest.svg';
import { ProjectType } from './types';

type ProjectTypeDetails = {
  label: string;
  icon: string;
  pastel: string;
  dark: string;
};

export const PROJECT_TYPES: Record<ProjectType, ProjectTypeDetails> = {
  socks: {
    label: 'Socks',
    icon: socksIcon,
    pastel: '148 219 207',
    dark: '56 168 150',
  },
  jumper: {
    label: 'Jumper',
    icon: jumperIcon,
    pastel: '193 142 230',
    dark: '122 50 174',
  },
  vest: {
    label: 'Vest',
    icon: vestIcon,
    pastel: '248 188 119',
    dark: '174 116 50',
  },
  cardigan: {
    label: 'Cardigan',
    icon: cardiganIcon,
    pastel: '248 140 185',
    dark: '174 50 102',
  },
  amigurumi: {
    label: 'Amigurumi',
    icon: amigurumiIcon,
    pastel: '160 160 238',
    dark: '50 50 174',
  },
  hat: {
    label: 'Hat',
    icon: hatIcon,
    pastel: '248 221 89',
    dark: '174 153 50',
  },
  blanket: {
    label: 'Blanket',
    icon: blanketIcon,
    pastel: '157 222 124',
    dark: '92 174 50',
  },
  shawl: {
    label: 'Shawl',
    icon: shawlIcon,
    pastel: '139 203 249',
    dark: '50 122 174',
  },
  accessory: {
    label: 'Accessory',
    icon: accessoryIcon,
    pastel: '245 142 132',
    dark: '174 61 50',
  },
};

export const LIST_LABELS = {
  meetings: 'Meetings',
  concentration: 'Concentration',
  future: 'Future',
};
