import type { CSSProperties } from 'react';
import type { GradientLayer, GradientParams } from './Gradient.types';

const random = (min: number, max: number) => {
  if (Number.isInteger(min) && Number.isInteger(max)) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  return Number((Math.random() * (max - min) + min).toFixed(2));
};

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const getGradientParams = (): GradientParams => {
  const colors = [
    { h: 250, s: 100, l: 60 },
    { h: 14, s: 80, l: 40 },
    { h: 294, s: 100, l: 40 },
    { h: 39, s: 100, l: 40 },
  ];

  const hueShift = random(0, 360);
  const palette = colors.map((c) => ({
    h: (c.h + hueShift) % 360,
    s: c.s,
    l: c.l,
  }));
  const base = pick(palette);

  return {
    base: `hsla(${base.h}, ${base.s}%, ${base.l}%, 1)`,
    layers: Array.from({ length: 12 }, (): GradientLayer => {
      const c = pick(palette);
      return {
        position: `${random(0, 100)}% ${random(0, 100)}%`,
        size: `${random(45, 85)}%`,
        color: `hsla(${c.h}, ${c.s}%, ${c.l}%, ${random(0.45, 0.75)})`,
      };
    }),
  };
};

export const getGradientCSS = (params: GradientParams): CSSProperties => {
  const layers = params.layers
    .map(
      (v) =>
        `radial-gradient(circle at ${v.position}, ${v.color}, transparent ${v.size})`,
    )
    .join(', ');

  return {
    backgroundColor: params.base,
    backgroundImage: layers,
    filter: 'saturate(125%)',
  };
};
