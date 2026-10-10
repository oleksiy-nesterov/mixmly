import { forwardRef } from 'react';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { ImageContext } from '@react-spectrum/s2';
import { useSlottedContext } from 'react-aria-components/slots';
import { cn } from '@/utils/cn';
import type { GradientParams } from './Gradient.types';
import { getGradientCSS } from './Gradient.utils';

type GradientProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  params: GradientParams;
  children?: ReactNode;
  style?: CSSProperties;
};

export const Gradient = forwardRef<HTMLDivElement, GradientProps>(
  function Gradient(
    { children, className, params, style, slot, ...props },
    ref,
  ) {
    const imageContext = useSlottedContext(ImageContext, slot);

    if (imageContext?.hidden) {
      return null;
    }

    return (
      <div
        {...props}
        ref={ref}
        className={cn(imageContext?.styles, className)}
        style={{
          ...(imageContext?.UNSAFE_style as CSSProperties | undefined),
          ...style,
          ...getGradientCSS(params),
        }}
      >
        {children}
      </div>
    );
  },
);
