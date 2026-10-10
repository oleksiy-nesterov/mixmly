import { Bodies, Body, Bounds, Vertices, type Vector } from 'matter-js';
import { GLYPH_FRICTION_AIR, SLICE_CATEGORY } from './Mixmly.constants';

export const splitTokens = (tokens: string) =>
  tokens.match(/\d+|[=+*/-]/g) ?? [];

export const createCanvas = (element: HTMLElement) => {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  canvas.style.background = 'transparent';
  element.append(canvas);
  return canvas;
};

export const getViewportSize = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  return {
    width: Math.max(1, Math.floor(rect.width || window.innerWidth)),
    height: Math.max(1, Math.floor(rect.height || window.innerHeight)),
  };
};

export const getGlyphPolygons = (g: Body): Vector[][] => {
  const parts = g.parts.length > 1 ? g.parts.slice(1) : [g];
  return parts
    .map((p) => p.vertices)
    .filter((vertices) => vertices.length >= 3);
};

export const clipPolygon = (
  vertices: Vector[],
  clipper: Vector[],
): Vector[] => {
  const EPS = 0.001;

  const direction =
    clipper.reduce((area, point, index) => {
      const next = clipper[(index + 1) % clipper.length];
      return area + point.x * next.y - next.x * point.y;
    }, 0) >= 0
      ? 1
      : -1;

  let output: Vector[] = vertices;

  for (let i = 0; i < clipper.length; i++) {
    const a = clipper[i];
    const b = clipper[(i + 1) % clipper.length];
    const input = output;
    output = [];

    for (let j = 0; j < input.length; j++) {
      const prev = input[(j - 1 + input.length) % input.length];
      const curr = input[j];

      const prevInside =
        direction *
          ((b.x - a.x) * (prev.y - a.y) - (b.y - a.y) * (prev.x - a.x)) >=
        -EPS;

      const currInside =
        direction *
          ((b.x - a.x) * (curr.y - a.y) - (b.y - a.y) * (curr.x - a.x)) >=
        -EPS;

      if (prevInside !== currInside) {
        const dx = curr.x - prev.x;
        const dy = curr.y - prev.y;
        const edgeDx = b.x - a.x;
        const edgeDy = b.y - a.y;
        const denominator = dx * edgeDy - dy * edgeDx;

        if (Math.abs(denominator) > EPS) {
          const t =
            ((a.x - prev.x) * edgeDy - (a.y - prev.y) * edgeDx) / denominator;

          output.push({
            x: prev.x + t * dx,
            y: prev.y + t * dy,
          });
        }
      }

      if (currInside) {
        output.push(curr);
      }
    }
  }
  return output;
};

const createVoronoiFragments = (g: Body, count = 30): Vector[][] => {
  const { min, max } = g.bounds;
  const fragments: Vector[][] = [];
  const padding = Math.max(max.x - min.x, max.y - min.y) * 2;
  const sourcePolygons = getGlyphPolygons(g);

  const bounds: Vector[] = [
    { x: min.x - padding, y: min.y - padding },
    { x: max.x + padding, y: min.y - padding },
    { x: max.x + padding, y: max.y + padding },
    { x: min.x - padding, y: max.y + padding },
  ];

  const points: Vector[] = Array.from({ length: count }, () => ({
    x: min.x + Math.random() * (max.x - min.x),
    y: min.y + Math.random() * (max.y - min.y),
  }));

  for (const point of points) {
    let cell = bounds;

    for (const other of points) {
      if (point === other || cell.length < 3) {
        continue;
      }

      const mid = {
        x: (point.x + other.x) / 2,
        y: (point.y + other.y) / 2,
      };

      const dx = other.x - point.x;
      const dy = other.y - point.y;

      const p1 = {
        x: mid.x - dy * padding,
        y: mid.y + dx * padding,
      };

      const p2 = {
        x: mid.x + dy * padding,
        y: mid.y - dx * padding,
      };

      let halfPlane: Vector[] = [
        p1,
        p2,
        { x: p2.x - dx * padding, y: p2.y - dy * padding },
        { x: p1.x - dx * padding, y: p1.y - dy * padding },
      ];

      const inside =
        (halfPlane[1].x - halfPlane[0].x) * (point.y - halfPlane[0].y) -
          (halfPlane[1].y - halfPlane[0].y) * (point.x - halfPlane[0].x) >=
        0;

      if (!inside) {
        halfPlane = halfPlane.reverse();
      }

      cell = clipPolygon(cell, halfPlane);
    }

    if (cell.length >= 3) {
      for (const source of sourcePolygons) {
        const fragment = clipPolygon(source, cell);
        if (fragment.length >= 3) {
          fragments.push(fragment);
        }
      }
    }
  }

  return fragments;
};

export const getGlyphSize = (g: Body) => {
  const bounds = Bounds.create(g.vertices);
  return {
    width: bounds.max.x - bounds.min.x,
    height: bounds.max.y - bounds.min.y,
  };
};

export const sliceToPolygons = (g: Body, step = 30, minArea = 1) => {
  const polygons: Body[] = [];
  const fragments = createVoronoiFragments(g, step);
  const size = getGlyphSize(g);

  for (const polygon of fragments) {
    if (polygon.length < 3) {
      continue;
    }

    const area = Math.abs(
      polygon.reduce((sum: number, point, index: number) => {
        const next = polygon[(index + 1) % polygon.length];
        return sum + point.x * next.y - next.x * point.y;
      }, 0) / 2,
    );

    if (area < minArea) {
      continue;
    }

    const center = Vertices.centre(polygon);
    const normalized = polygon.map((point) => ({
      x: point.x - center.x,
      y: point.y - center.y,
    }));

    const piece = Bodies.fromVertices(
      center.x,
      center.y,
      [normalized],
      {
        label: g.label,
        frictionAir: GLYPH_FRICTION_AIR,
        frictionStatic: g.frictionStatic,
        friction: g.friction,
        restitution: g.restitution,
        slop: g.slop,
        collisionFilter: {
          category: SLICE_CATEGORY,
        },
        render: g.render,
        plugin: {
          polygon: normalized,
          size,
          offset: {
            x: center.x - g.position.x,
            y: center.y - g.position.y,
          },
          payload: g.plugin?.payload,
        },
      },
      true,
    );

    if (piece) {
      const dx = center.x - g.position.x;
      const dy = center.y - g.position.y;
      const len = Math.hypot(dx, dy) || 1;
      Body.setVelocity(piece, {
        x: (dx / len) * 6 + (Math.random() - 0.5) * 2,
        y: (dy / len) * 6 + (Math.random() - 0.5) * 2,
      });
      Body.setAngularVelocity(piece, (Math.random() - 0.5) * 0.25);
      polygons.push(piece);
    }
  }

  return polygons;
};
