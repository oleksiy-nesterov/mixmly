import { useMemo, type SVGProps, JSX } from 'react';
import {
  getSvgTokenDefinition,
  getTokenColor,
  getTokenScale,
} from './Tokens.utils';
import {
  TOKEN_DEFAULT_GAP,
  TOKEN_DEFAULT_HEIGHT,
} from '@/components/Tokens/Tokens.constants.ts';

export type SvgTokenProps = Omit<
  SVGProps<SVGSVGElement>,
  'children' | 'height' | 'width'
> & {
  token: string;
  size?: number;
};

export const SvgToken = ({
  token,
  size = TOKEN_DEFAULT_HEIGHT,
  ...props
}: SvgTokenProps) => {
  const { box, elements } = useMemo(() => {
    const color = getTokenColor(token[0]);
    const chars = [...token];
    const definitions = chars.map(getSvgTokenDefinition);
    const box = {
      x: 0,
      y: 0,
      width: 0,
      height: definitions.reduce((max, v) => Math.max(v?.height ?? 0, max), 0),
    };

    const elements = definitions
      .map((definition, index, arr) => {
        if (!definition) return null;

        const { d, width, height } = definition;
        const translateX = box.width;
        const translateY = (box.height - height) / 2;
        box.width += width + (index < arr.length - 1 ? TOKEN_DEFAULT_GAP : 0);

        return (
          <path
            d={d}
            fill={color}
            style={{
              transform: `translateX(${translateX}px) translateY(${translateY}px)`,
            }}
            key={index}
          />
        );
      })
      .filter(Boolean) as JSX.Element[];

    return { box, elements };
  }, [token]);

  if (elements.length === 0) {
    return null;
  }

  return (
    <svg
      {...props}
      width={box.width * getTokenScale(size)}
      height={size}
      viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {elements}
    </svg>
  );
};
