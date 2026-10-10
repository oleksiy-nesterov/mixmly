import Matter, { Vector } from 'matter-js';
import {
  GLYPH_CATEGORY,
  GLYPH_SCALE,
  SLICE_CATEGORY,
} from '@/mixmly/Mixmly.constants.ts';
import { MixmlyGlyphPayload } from '@/mixmly/Mixmly.types.ts';
import {
  TOKEN_COLORS,
  TOKEN_DEFAULT_COLOR,
} from '@/components/Tokens/Tokens.constants.ts';
import { type Stats } from '@/store/Store';

export const getStatsForTokens = (tokens: string[]): Partial<Stats> => {
  const numbers = tokens.filter((token) => /\d+/.test(token)).map(Number);

  return {
    completedExampleCount: 1,
    plusCount: tokens.filter((token) => token === '+').length,
    minusCount: tokens.filter((token) => token === '-').length,
    divideCount: tokens.filter((token) => token === '/').length,
    multiplyCount: tokens.filter((token) => token === '*').length,
    digitCount: numbers.length,
    doubleDigitCount: numbers.filter((token) => Math.abs(token) >= 10).length,
    digitSum: numbers.reduce((sum, num) => sum + num, 0),
    digitMax: Math.max(...numbers) || 0,
  };
};

export const render = (
  glyph: Matter.Body,
  engine: Matter.Engine,
  // mixmly: Mixmly,
) => {
  if (!glyph.plugin?.payload) return;

  const ctx = engine.render.context;
  const visualScale = glyph.plugin?.state?.scale ?? GLYPH_SCALE;
  const color = TOKEN_COLORS[glyph.label[0]] || TOKEN_DEFAULT_COLOR;

  // mixmly.hoveredGlyph;

  if (glyph.collisionFilter.category === GLYPH_CATEGORY) {
    glyph.plugin.payload.forEach((payload: MixmlyGlyphPayload) => {
      const { path2d, center, localX, localY } = payload;
      ctx.save();
      ctx.translate(glyph.position.x, glyph.position.y);
      ctx.rotate(glyph.angle);
      ctx.scale(visualScale, visualScale);
      ctx.translate(localX - center.x, localY - center.y);
      ctx.fillStyle = color;
      ctx.fill(path2d);
      ctx.restore();
    });
    return;
  }

  if (
    glyph.collisionFilter.category === SLICE_CATEGORY &&
    glyph.plugin?.polygon
  ) {
    const { polygon, payload } = glyph.plugin;
    if (payload) {
      ctx.save();
      ctx.translate(glyph.position.x, glyph.position.y);
      ctx.rotate(glyph.angle);
      ctx.beginPath();
      polygon.forEach((p: Vector, index: number) => {
        if (index === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
      return;
    }
  }
};
