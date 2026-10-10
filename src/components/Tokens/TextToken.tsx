import type { HTMLAttributes } from 'react';
import {
  TOKEN_DEFAULT_HEIGHT,
  TEXT_TOKEN_FONT_FAMILY,
  TEXT_TOKEN_FONT_WEIGHT,
} from './Tokens.constants';
import { getTokenColor } from './Tokens.utils';

export type TextTokenProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  'children'
> & {
  token: string;
  size?: number;
};

export const TextToken = ({
  token,
  size = TOKEN_DEFAULT_HEIGHT,
  style,
  ...props
}: TextTokenProps) => (
  <span
    {...props}
    style={{
      color: getTokenColor(token),
      display: 'inline-flex',
      alignItems: `center`,
      fontFamily: TEXT_TOKEN_FONT_FAMILY,
      fontWeight: TEXT_TOKEN_FONT_WEIGHT,
      fontSize: `calc(${size}px * 1.35)`,
      paddingBottom: `calc(${size}px * 0.1)`,
      lineHeight: 1,
      height: size,
      overflow: 'hidden',
      userSelect: 'none',
      ...style,
    }}
  >
    {token}
  </span>
);
