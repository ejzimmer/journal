const EMOJI_RANGES = [
  [0x1f300, 0x1f5ff],
  [0x1f600, 0x1f64f],
  [0x1f680, 0x1f6ff],
  [0x1f900, 0x1f9ff],
  [0x1fa70, 0x1faff],
  [0x2600, 0x27bf],
];

const toEmoji = (codePoint: number) => {
  const character = String.fromCodePoint(codePoint);
  if (/\p{Emoji_Presentation}/u.test(character)) {
    return character;
  }
  if (/\p{Extended_Pictographic}/u.test(character)) {
    return `${character}️`;
  }
};

export const ALL_EMOJI = EMOJI_RANGES.flatMap(([start, end]) =>
  Array.from({ length: end - start + 1 }, (_, index) => toEmoji(start + index)),
).filter((emoji) => emoji !== undefined);
