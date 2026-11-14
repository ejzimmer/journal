export const MODE_COLOURS = [
  { name: 'Red', colour: '#d11c2e' },
  { name: 'Orange', colour: '#f9b20e' },
  { name: 'Yellow', colour: '#fad200' },
  { name: 'Blue', colour: '#4baae3' },
  { name: 'Green', colour: '#2a9940' },
  { name: 'Pink', colour: '#f25cb5' },
];

export const findUnusedColour = (usedColours: string[]) =>
  (
    MODE_COLOURS.find(({ colour }) => !usedColours.includes(colour)) ??
    MODE_COLOURS[0]
  ).colour;
