import type Matter from 'matter-js';
import type Mixmly from './Mixmly';

export type MixmlyGlyphPayload = {
  vertices: Matter.Vector[];
  center: Matter.Vector;
  position: Matter.Vector;
  width: number;
  height: number;
  localX: number;
  localY: number;
  path2d: Path2D;
};

export type MixmlyGlyphState = {
  angle: number;
  scale: number;
  previousState: MixmlyGlyphState | null;
};

export type MixmlyRenderer = (
  glyph: Matter.Body,
  engine: Matter.Engine,
  mixmly: Mixmly,
) => void;

export type MixmlyAction = 'click' | 'drag';

export type MixmlyOptions = {
  element: HTMLElement;
  debug?: boolean;
  onRender: MixmlyRenderer;
  onChange?: (tokens: string[]) => void;
  onComplete?: (tokens: string[]) => void;
  onAction?: (action: MixmlyAction) => void;
};

export type MixmlySomething = Parameters<typeof Matter.Composite.add>[1];
