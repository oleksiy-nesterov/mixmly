import { style } from '@react-spectrum/s2/style' with { type: 'macro' };

export const fullscreenDialogContentStyles = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'center',
  gap: 16,
  textAlign: 'center',
  width: '100%',
  minHeight: '100%',
  boxSizing: 'border-box',
  paddingY: 24,
});
