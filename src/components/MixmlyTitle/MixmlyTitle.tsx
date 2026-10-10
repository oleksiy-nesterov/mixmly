import { style } from '@react-spectrum/s2/style' with { type: 'macro' };
import { MIXMLY_TITLE_COLORS } from './MixmlyTitle.constants';

const titleStyles = style({
  margin: 0,
  textAlign: 'center',
  whiteSpace: 'pre-wrap',
});

export type MixmlyTitleProps = {
  text: string;
  size: number;
};

export const MixmlyTitle = ({ text, size }: MixmlyTitleProps) => (
  <h1
    className={titleStyles}
    aria-label={text}
    style={{
      fontFamily: 'Fredoka, sans-serif',
      fontSize: size,
      fontWeight: 600,
      lineHeight: 1.1,
    }}
  >
    {Array.from(text).map((character, index) => (
      <span
        key={`${character}-${index}`}
        aria-hidden="true"
        style={{
          color: MIXMLY_TITLE_COLORS[index % MIXMLY_TITLE_COLORS.length],
        }}
      >
        {character}
      </span>
    ))}
  </h1>
);
