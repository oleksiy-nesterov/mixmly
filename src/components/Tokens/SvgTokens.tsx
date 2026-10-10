import type { HTMLAttributes } from 'react';
import { style } from '@react-spectrum/s2/style' with { type: 'macro' };
import { cn } from '@/utils/cn';
import { TOKEN_DEFAULT_GAP } from './Tokens.constants';
import { getTokenScale } from './Tokens.utils';
import { SvgToken } from './SvgToken';

const tokensStyles = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  userSelect: 'none',
  cursor: 'default',
});

export type SvgTokensProps = HTMLAttributes<HTMLDivElement> & {
  tokens: string[];
  size?: number;
};

export const SvgTokens = ({
  tokens,
  size,
  className,
  style,
  ...props
}: SvgTokensProps) => {
  return (
    <div
      {...props}
      style={{ gap: TOKEN_DEFAULT_GAP * getTokenScale(size), ...style }}
      className={cn(tokensStyles, className)}
      title={tokens.join('')}
    >
      {tokens.map((token, index) => (
        <SvgToken key={`${token}-${index}`} token={token} size={size} />
      ))}
    </div>
  );
};
