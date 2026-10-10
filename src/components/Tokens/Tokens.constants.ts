export const TEXT_TOKEN_FONT_WEIGHT = 600;
export const TEXT_TOKEN_FONT_FAMILY = 'Fredoka';

export const TOKEN_PATHS = [
  ...document.querySelectorAll<SVGPathElement>('svg path'),
];
export const TOKEN_DEFAULT_WIDTH = 72;
export const TOKEN_DEFAULT_HEIGHT = 100;
export const TOKEN_DEFAULT_GAP = TOKEN_DEFAULT_WIDTH * 0.2;
export const TOKEN_DEFAULT_COLOR = '#fc00e8ff';
export const TOKEN_COLORS: Record<string, string> = {
  0: '#ff0000',
  1: '#ff8700',
  2: '#ffd300',
  3: '#deff0a',
  4: '#a1ff0a',
  5: '#0aff99',
  6: '#0aefff',
  7: '#147df5',
  8: '#580aff',
  9: '#be0aff',
};
