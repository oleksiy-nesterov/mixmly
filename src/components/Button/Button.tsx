import {
  Button as SpectrumButton,
  type ButtonProps,
} from '@react-spectrum/s2/Button';
import { style } from '@react-spectrum/s2/style' with { type: 'macro' };
import { cn } from '@/utils/cn';

export type { ButtonProps };

const activeButtonStyles = style({
  cursor: 'pointer',
});

export const Button = ({
  variant,
  UNSAFE_className,
  isDisabled,
  isPending,
  ...props
}: ButtonProps) => {
  const activeClassName = !isDisabled && !isPending ? activeButtonStyles : null;

  return (
    <SpectrumButton
      {...props}
      UNSAFE_className={`${cn(UNSAFE_className, activeClassName)} `}
      isDisabled={isDisabled}
      isPending={isPending}
      variant={variant || 'premium'}
    />
  );
};
