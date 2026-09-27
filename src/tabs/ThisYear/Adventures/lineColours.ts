export const LINE_COLOURS = [
  { name: 'Hurstbridge and Mernda', colour: '#d11c2e' },
  { name: 'Craigieburn and Upfield', colour: '#f9b20e' },
  { name: 'Racecourse', colour: '#fad200' },
  { name: 'Cranbourne, Pakenham and Sunbury', colour: '#4baae3' },
  { name: 'Frankston and Stony Point', colour: '#2a9940' },
  { name: 'Sandringham, Werribee and Williamstown', colour: '#f25cb5' },
];

export const findUnusedLineColour = (usedColours: string[]) =>
  (
    LINE_COLOURS.find(({ colour }) => !usedColours.includes(colour)) ??
    LINE_COLOURS[0]
  ).colour;
