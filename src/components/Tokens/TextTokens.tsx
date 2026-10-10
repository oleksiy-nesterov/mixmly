import type { HTMLAttributes } from 'react';
import { style } from '@react-spectrum/s2/style' with { type: 'macro' };
import { cn } from '@/utils/cn';
import { TextToken } from './TextToken';
import { getTokenScale } from '@/components/Tokens/Tokens.utils.ts';
import { TOKEN_DEFAULT_GAP } from '@/components/Tokens/Tokens.constants.ts';

const tokensStyles = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  userSelect: 'none',
  cursor: 'default',
});

export type TextTokensProps = HTMLAttributes<HTMLDivElement> & {
  tokens: string[];
  size?: number;
};

export const TextTokens = ({
  tokens,
  size,
  className,
  style,
  ...props
}: TextTokensProps) => {
  return (
    <div
      {...props}
      style={{ gap: TOKEN_DEFAULT_GAP * getTokenScale(size), ...style }}
      className={cn(tokensStyles, className)}
      title={tokens.join('')}
    >
      {tokens.map((token, index) => (
        <TextToken key={`${token}-${index}`} token={token} size={size} />
      ))}
    </div>
  );
};
