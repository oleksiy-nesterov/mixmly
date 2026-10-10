import {
  TOKEN_COLORS,
  TOKEN_PATHS,
  TOKEN_DEFAULT_COLOR,
  TOKEN_DEFAULT_HEIGHT,
  TOKEN_DEFAULT_WIDTH,
} from './Tokens.constants';

export const getTokenColor = (text: string) =>
  TOKEN_COLORS[text[0]] ?? TOKEN_DEFAULT_COLOR;

export const getTokenScale = (size = TOKEN_DEFAULT_HEIGHT) =>
  size / TOKEN_DEFAULT_HEIGHT;

export const getTokenPath = (token: string) =>
  TOKEN_PATHS.find((path) => path.id === token) ?? null;

export const getSvgTokenDefinition = (token: string) => {
  const path = getTokenPath(token);

  if (!path) {
    return null;
  }

  const d = path.getAttribute('d') ?? '';
  const width = parseFloat(
    path.getAttribute('data-width') || String(TOKEN_DEFAULT_WIDTH),
  );
  const height = parseFloat(
    path.getAttribute('data-height') || String(TOKEN_DEFAULT_HEIGHT),
  );

  return { d, width, height };
};
